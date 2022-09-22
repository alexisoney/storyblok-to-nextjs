import React from 'react'
import NextImage, {ImageProps} from 'next/future/image'
import {getHeight, getWidth, isOptimizable, storyblokLoader} from './Image.helpers'

export const Image = (
  props: Omit<ImageProps, 'src' | 'alt'> & {src?: string; alt?: string}
): JSX.Element => {
  return isOptimizable(props.src) ? (
    <NextImage
      src={props.src}
      width={props.fill ? undefined : getWidth(props.src)}
      height={props.fill ? undefined : getHeight(props.src)}
      loader={storyblokLoader}
      alt={props.alt || ''}
      {...props}
    />
  ) : (
    <img src={props.src} alt={props.alt} title={props.title} {...props} />
  )
}
