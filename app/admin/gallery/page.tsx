import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import GalleryUploader from './GalleryUploader'
import GalleryGrid from './GalleryGrid'

export default async function AdminGalleryPage() {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user.role === 'ADMIN'

  const images = await prisma.galleryImage.findMany({
    orderBy: { createdAt: 'desc' },
    include: { createdBy: { select: { name: true, email: true } } },
  })

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Gallery
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {isAdmin
            ? 'Upload photos, and review, approve, or remove submissions.'
            : 'Upload photos for the public gallery. An admin will approve them before they go live.'}
        </p>
      </div>

      <div className="mb-6 sm:mb-8">
        <GalleryUploader isAdmin={isAdmin} />
      </div>

      <GalleryGrid
        isAdmin={isAdmin}
        images={images.map((image) => ({
          ...image,
          createdAt: image.createdAt.toISOString(),
        }))}
      />
    </div>
  )
}
