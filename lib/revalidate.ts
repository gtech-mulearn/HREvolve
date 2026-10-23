import { revalidatePath } from 'next/cache'

// Public pages are statically generated with a short revalidate window. Call this
// after any admin change to events, gallery, sponsors or the core team so the change
// shows up immediately instead of after the window expires.
export function revalidatePublicPages() {
  revalidatePath('/')
  revalidatePath('/events')
  revalidatePath('/gallery')
  revalidatePath('/chapters/[city]', 'page')
}
