'use client'

import NextImage, { ImageProps as NextImageProps } from 'next/image'

import clsx from 'clsx'
import { useState } from 'react'

type ImageProps = {
  rounded?: string
} & NextImageProps

const Image = (props: ImageProps) => {
  const { alt, src, className, rounded, fill, priority, ...rest } = props
  const [isLoading, setLoading] = useState(true)

  return (
    <div className={clsx(
      'overflow-hidden',
      isLoading ? 'animate-pulse' : '',
      rounded,
      fill ? 'relative h-full w-full' : '' // Add relative positioning and full dimensions when using fill
    )}>
      <NextImage
        data-testid="image"
        className={clsx(
          'duration-700 ease-in-out',
          isLoading ? 'scale-[1.02] blur-xl grayscale' : 'scale-100 blur-0 grayscale-0',
          rounded,
          className
        )}
        src={src}
        alt={alt}
        loading={priority ? undefined : "lazy"} // Don't set loading when priority is true
        quality={100}
        onLoad={() => setLoading(false)}
        fill={fill}
        priority={priority}
        {...rest}
      />
    </div>
  )
}
export default Image
