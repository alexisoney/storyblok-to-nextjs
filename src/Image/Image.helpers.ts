import {ImageLoaderProps} from 'next/image'

export const isOptimizable = (src?: string): src is string => {
  if (src && !src.endsWith('.svg') && src.includes('a.storyblok.com')) {
    return true
  }

  return false
}

export const getWidth = (src: string): number => {
  const size = src.split(/\/+/g)[4]
  const width = parseInt(size.split('x')[0])

  if (!isNaN(width)) return width

  throw Error(`Can't get width from ${src}`)
}

export const getHeight = (src: string): number => {
  const size = src.split(/\/+/g)[4]
  const height = parseInt(size.split('x')[1])

  if (!isNaN(height)) return height

  throw Error(`Can't get height from ${src}`)
}

export const storyblokLoader = ({src, width, quality}: ImageLoaderProps): string => {
  if (isOptimizable(src)) {
    return src + `/m/${width}x0/smart/filters:quality(${quality || 75})`
  }

  throw Error(`src not optimizable: ${src}`)
}
