'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export async function sendInvitation(data: {
  child_name: string
  child_email: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Verify user is a parent
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'parent') throw new Error('Only parents can send invitations')

  // Create invitation record
  const { data: invitation, error: invError } = await supabase
    .from('invitations')
    .insert({
      parent_id: user.id,
      child_name: data.child_name,
      child_email: data.child_email,
    })
    .select('token')
    .single()

  if (invError) throw invError

  // Send invite email via Supabase Auth admin
  const adminClient = createAdminClient()
  const headersList = await headers()
  const origin = headersList.get('origin') || headersList.get('referer')?.replace(/\/[^/]*$/, '') || ''

  const { error: emailError } = await adminClient.auth.admin.inviteUserByEmail(
    data.child_email,
    {
      redirectTo: `${origin}/invite/accept?token=${invitation.token}`,
      data: {
        invitation_token: invitation.token,
        invited_by: user.id,
        child_name: data.child_name,
      },
    }
  )

  if (emailError) {
    // If user already exists, the invite email still needs to be sent
    // Clean up the invitation if email fails for other reasons
    if (!emailError.message.includes('already been registered')) {
      await supabase.from('invitations').delete().eq('token', invitation.token)
      throw emailError
    }
  }

  revalidatePath('/dashboard')
  return { token: invitation.token }
}

export async function getInvitations() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('parent_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) return []
  return data ?? []
}

export async function revokeInvitation(invitationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('invitations')
    .delete()
    .eq('id', invitationId)
    .eq('parent_id', user.id)
    .eq('status', 'pending')

  if (error) throw error

  revalidatePath('/dashboard')
}
