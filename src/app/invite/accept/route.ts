import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token = searchParams.get('token')
  const code = searchParams.get('code')

  if (!token) {
    return NextResponse.redirect(`${origin}/login?error=invalid_invitation`)
  }

  const supabase = await createClient()

  // If there's an auth code (from Supabase invite email), exchange it for session
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // Not logged in — redirect to Google OAuth with invite context
    return NextResponse.redirect(`${origin}/invite/join?token=${token}`)
  }

  // Validate invitation
  const { data: invitation, error: invError } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .single()

  if (invError || !invitation) {
    return NextResponse.redirect(`${origin}/login?error=invalid_invitation`)
  }

  // Check if invitation is expired
  if (new Date(invitation.expires_at) < new Date()) {
    return NextResponse.redirect(`${origin}/login?error=invitation_expired`)
  }

  // Update profile to child role
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      role: 'child',
      parent_id: invitation.parent_id,
      display_name: invitation.child_name,
    })
    .eq('id', user.id)

  if (profileError) {
    // Profile might not exist yet (trigger might be slow), try insert
    await supabase.from('profiles').upsert({
      id: user.id,
      role: 'child',
      parent_id: invitation.parent_id,
      display_name: invitation.child_name,
      avatar_url: user.user_metadata?.avatar_url ?? null,
    })
  }

  // Mark invitation as accepted
  await supabase
    .from('invitations')
    .update({ status: 'accepted' })
    .eq('token', token)

  return NextResponse.redirect(`${origin}/dashboard`)
}
