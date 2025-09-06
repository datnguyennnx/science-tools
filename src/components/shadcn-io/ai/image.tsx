import { cn } from '@/lib/utils'
import ImagePrimitive from 'next/image'
import { ImageProps as NextImageProps } from 'next/image'
import type { Experimental_GeneratedImage } from 'ai'

export type ImageProps = Experimental_GeneratedImage & {
  className?: string
  alt?: string
}

export const Image = ({ base64, mediaType, ...props }: ImageProps & NextImageProps) => (
  <ImagePrimitive
    {...props}
    alt={props.alt}
    className={cn('h-auto max-w-full overflow-hidden rounded-md', props.className)}
    src={`data:${mediaType};base64,${base64}`}
  />
)
