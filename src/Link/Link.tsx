import React from 'react'

import NextLink from 'next/link'
import {useRouter} from 'next/router'
import {AnchorHTMLAttributes} from 'react'
import {StoryblokLink} from '../types'
import {makeEditable} from '../makeEditable'

const classNames = (classNames: (string | undefined | false)[]): string =>
  classNames.filter(Boolean).join(' ')

type Link = {
  className?: string
  activeClassName?: string
  link?: StoryblokLink
  label?: string
  children?: React.ReactNode
  _editable?: string
}

const Wrapper = ({href, children}: {href?: string; children: React.ReactNode}) =>
  href ? (
    <NextLink href={href} scroll={false}>
      {children}
    </NextLink>
  ) : (
    <>{children}</>
  )

export const Link = ({
  label,
  link,
  children,
  className,
  activeClassName = '',
  _editable,
}: Link): JSX.Element | null => {
  const router = useRouter()

  let storyblokLink: StoryblokLink | undefined

  if (link) {
    storyblokLink = link
  }

  if ((!label && !children) || !storyblokLink) return null

  let href = ''
  let isActive = false
  let linkOptions: AnchorHTMLAttributes<HTMLAnchorElement> = {}

  if (storyblokLink.linktype === 'story') {
    if (storyblokLink.story) {
      href = `/${storyblokLink.story.url.replace('index', '')}`
      isActive = router.asPath === (href.length > 1 ? href.replace(/\/$/, '') : href)
    }
  } else {
    linkOptions = {
      href: storyblokLink.url,
      target: '_blank',
      rel: 'noreferrer',
    }
  }

  return (
    <Wrapper href={storyblokLink.linktype === 'story' ? href : undefined}>
      <a
        {...makeEditable(_editable)}
        className={classNames([className, isActive && activeClassName])}
        {...linkOptions}
      >
        {label || children}
      </a>
    </Wrapper>
  )
}

export default Link
