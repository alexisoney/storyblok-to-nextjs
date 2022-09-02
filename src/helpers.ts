import {StoryData} from 'storyblok-js-client'
import urljoin from 'url-join'

type Story = Pick<StoryData, 'full_slug' | 'default_full_slug'> & {
  parent_id: number | null
}

export function toStoryblokSlug(
  languages: string[],
  nextSlug: string | string[] | undefined
): string {
  console.log(nextSlug)
  let language: string | undefined
  let slug: string

  if (Array.isArray(nextSlug)) {
    if (languages.includes(nextSlug[0])) {
      language = nextSlug[0]
      if (nextSlug.length === 1) {
        slug = [language, 'index'].join('/')
      } else {
        slug = nextSlug.join('/')
      }
    } else {
      slug = nextSlug.join('/')
    }
  } else if (typeof nextSlug === 'undefined') {
    slug = 'index'
  } else {
    throw Error('getStaticProps: params.slug is not an array')
  }

  console.log(slug)
  return slug
}

export function normalizeUrl(slugs: string[], story: {parent_id: number | null}): string {
  const slug = urljoin(slugs)
  const formattedSlug = story.parent_id === null ? slug.replace(/\/?index/, '') : slug
  const withoutTrailingSlash = formattedSlug.replace(/\/$/, '')
  return withoutTrailingSlash ? withoutTrailingSlash : '/'
}

export function getFullSlug({full_slug, parent_id}: Story): string {
  return normalizeUrl([full_slug], {parent_id})
}

export function getTranslatedSlug(
  story: {
    full_slug: string
    parent_id: number | null
    lang: string
  },
  languages: string[]
) {
  if (languages.length === 0) return []

  if (story.lang === 'default') {
    const full_slug = story.full_slug === 'index' ? '' : story.full_slug
    return languages.map((lang) => ({
      lang,
      name: null,
      path: normalizeUrl([lang, full_slug], story),
    }))
  }

  if (story.full_slug === story.lang) {
    return [
      {
        lang: 'default',
        name: null,
        path: '',
      },
    ].concat(
      languages
        .filter((lang) => lang !== story.lang)
        .map((lang) => ({
          lang,
          name: null,
          path: normalizeUrl([lang], story),
        }))
    )
  }

  const baseSlug = story.full_slug.replace(new RegExp(`^${story.lang}\/?`), '')

  return [
    {
      lang: 'default',
      name: null,
      path: normalizeUrl([baseSlug], story),
    },
  ].concat(
    languages
      .filter((lang) => lang !== story.lang)
      .map((lang) => ({
        lang,
        name: null,
        path: normalizeUrl([lang, baseSlug], story),
      }))
  )
}
