'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { X, UserPlus, Send } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sendInvitation } from '@/lib/actions/invitations'

interface InviteChildDialogProps {
  open: boolean
  onClose: () => void
}

export function InviteChildDialog({ open, onClose }: InviteChildDialogProps) {
  const [form, setForm] = useState({ child_name: '', child_email: '' })
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)
  const router = useRouter()

  function handleClose() {
    setForm({ child_name: '', child_email: '' })
    setSent(false)
    onClose()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.child_name || !form.child_email) return
    startTransition(async () => {
      await sendInvitation(form)
      router.refresh()
      setSent(true)
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="bg-gradient-to-br from-slate-900 to-purple-900 border border-purple-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl [&>button]:hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white">הזמנת ילד/ה</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}
            className="text-purple-300 hover:text-white hover:bg-purple-500/20 rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="text-5xl mb-4">📧</div>
            <h3 className="text-white font-bold text-lg mb-2">ההזמנה נשלחה!</h3>
            <p className="text-purple-300/70 text-sm mb-6">
              שלחנו הזמנה ל-{form.child_email}
            </p>
            <Button onClick={handleClose}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl">
              סגור
            </Button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-purple-300 text-sm">שם הילד/ה</Label>
              <Input
                value={form.child_name}
                onChange={(e) => setForm(p => ({ ...p, child_name: e.target.value }))}
                placeholder="דניאל"
                className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-400/50 rounded-xl mt-1"
                required
              />
            </div>
            <div>
              <Label className="text-purple-300 text-sm">כתובת אימייל</Label>
              <Input
                type="email"
                value={form.child_email}
                onChange={(e) => setForm(p => ({ ...p, child_email: e.target.value }))}
                placeholder="child@example.com"
                className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-400/50 rounded-xl mt-1"
                dir="ltr"
                required
              />
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-6 rounded-xl text-lg shadow-lg shadow-purple-500/30"
              >
                <Send className="w-5 h-5 ms-2" />
                {isPending ? 'שולח...' : 'שלח הזמנה'}
              </Button>
            </motion.div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
