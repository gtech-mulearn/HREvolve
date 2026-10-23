import { getPublishedGalleryImages } from '@/lib/public-data'
import GalleryView, { type GalleryImage } from './GalleryView'

// Statically generated; refreshed every minute and on admin changes (revalidatePublicPages)
export const revalidate = 60

export default async function GalleryPage() {
  let images: GalleryImage[] = []
  try {
    images = await getPublishedGalleryImages()
  } catch (error) {
    console.error('Failed to load gallery images for /gallery:', error)
  }

  return <GalleryView images={images} />
}
