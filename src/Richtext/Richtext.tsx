import React, {ComponentProps} from 'react'
import Link from 'next/link'
import {Fragment} from 'react'
import {
  MARK_BOLD,
  MARK_LINK,
  MARK_ITALIC,
  MARK_STRIKE,
  MARK_UNDERLINE,
  render,
  RenderOptions,
} from 'storyblok-rich-text-react-renderer'
import {Image} from '../Image'
import {StoryblokRichtext} from '../types'

import {isEmptyRichtext} from './Richtext.helpers'

type RichtextProps = {
  richtext?: StoryblokRichtext
  className?: string
  classNames?: {
    bold?: string
    italic?: string
    strike?: string
    underline?: string
  }
  tags?: {
    paragraph?: keyof JSX.IntrinsicElements | null
  }
  imageProps?: ComponentProps<typeof Image>
  renderOptions?: RenderOptions
}

export const Richtext = ({
  richtext,
  className,
  classNames = {},
  tags = {},
  imageProps = {},
  renderOptions = {},
}: RichtextProps): JSX.Element | null => {
  if (isEmptyRichtext(richtext)) return null

  const ParagraphTag = tags.paragraph === null ? Fragment : tags.paragraph || 'p'

  return (
    <div className={className}>
      {render(richtext, {
        nodeResolvers: {
          paragraph: (children) => <ParagraphTag>{children}</ParagraphTag>,
          image: (_, props) => <Image {...props} {...imageProps} />,
          ...renderOptions.nodeResolvers,
        },
        markResolvers: {
          [MARK_BOLD]: (children) => <b className={classNames.bold}>{children}</b>,
          [MARK_ITALIC]: (children) => <i className={classNames.italic}>{children}</i>,
          [MARK_STRIKE]: (children) => <s className={classNames.strike}>{children}</s>,
          [MARK_UNDERLINE]: (children) => <u className={classNames.underline}>{children}</u>,
          [MARK_LINK]: (children, props) => {
            const {href, target, linktype} = props
            if (linktype === 'email') {
              // Email links: add `mailto:` scheme and map to <a>
              return <a href={`mailto:${href}`}>{children}</a>
            }
            if (href && href.match(/^(https?:)?\/\//)) {
              // External links: map to <a>
              return (
                <a href={href} target={target}>
                  {children}
                </a>
              )
            }
            // Internal links: map to <Link>
            return (
              <Link href={href || ''}>
                <a>{children}</a>
              </Link>
            )
          },
          ...renderOptions.markResolvers,
        },
      })}
    </div>
  )
}
