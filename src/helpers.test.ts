import {normalizeUrl, getTranslatedSlug, getNextSlug} from './helpers'

describe('getNextSlug', () => {
  it('should not return config folder', () => {
    expect(getNextSlug({full_slug: '__config/config', parent_id: 123})).toBe(undefined)
  })

  it('should not return translated config folder', () => {
    expect(getNextSlug({full_slug: 'en/__config/config', parent_id: 123})).toBe(undefined)
  })
})

describe('normalizeUrl', () => {
  it('should convert root index to /', () => {
    expect(normalizeUrl(['index'], {parent_id: null})).toBe('/')
    expect(normalizeUrl(['index'], {parent_id: 0})).toBe('/')
  })

  it('should keep nested index', () => {
    expect(normalizeUrl(['blog/index'], {parent_id: 123})).toBe('blog/index')
  })
})

describe('getTranslatedSlug', () => {
  it('should return an empty array when languages is empty', () => {
    const story = {parent_id: null, full_slug: 'blog', lang: 'default'}
    expect(getTranslatedSlug(story, [])).toStrictEqual([])
  })

  it('should return translated slugs for root', () => {
    const story = {parent_id: null, full_slug: 'index', lang: 'default'}
    const languages = ['en', 'it']
    expect(getTranslatedSlug(story, languages)).toStrictEqual([
      {
        lang: 'en',
        name: null,
        path: 'en',
      },
      {
        lang: 'it',
        name: null,
        path: 'it',
      },
    ])
  })

  it('should return a default slug for root', () => {
    const story = {parent_id: null, full_slug: 'en', lang: 'en'}
    const languages = ['en', 'it']
    expect(getTranslatedSlug(story, languages)).toStrictEqual([
      {
        lang: 'default',
        name: null,
        path: '',
      },
      {
        lang: 'it',
        name: null,
        path: 'it',
      },
    ])
  })

  it('should return translated slugs for folder root', () => {
    const story = {parent_id: 123, full_slug: 'blog', lang: 'default'}
    const languages = ['en', 'it']
    expect(getTranslatedSlug(story, languages)).toStrictEqual([
      {
        lang: 'en',
        name: null,
        path: 'en/blog',
      },
      {
        lang: 'it',
        name: null,
        path: 'it/blog',
      },
    ])
  })

  it('should return a default slug for folder root', () => {
    const story = {parent_id: 123, full_slug: 'en/blog', lang: 'en'}
    const languages = ['en', 'it']
    expect(getTranslatedSlug(story, languages)).toStrictEqual([
      {
        lang: 'default',
        name: null,
        path: 'blog',
      },
      {
        lang: 'it',
        name: null,
        path: 'it/blog',
      },
    ])
  })

  it('should return translated slugs for nested page', () => {
    const story = {parent_id: 123, full_slug: 'blog/1', lang: 'default'}
    const languages = ['en', 'it']
    expect(getTranslatedSlug(story, languages)).toStrictEqual([
      {
        lang: 'en',
        name: null,
        path: 'en/blog/1',
      },
      {
        lang: 'it',
        name: null,
        path: 'it/blog/1',
      },
    ])
  })

  it('should return a default slug for nested page', () => {
    const story = {parent_id: 123, full_slug: 'en/blog/1', lang: 'en'}
    const languages = ['en', 'it']
    expect(getTranslatedSlug(story, languages)).toStrictEqual([
      {
        lang: 'default',
        name: null,
        path: 'blog/1',
      },
      {
        lang: 'it',
        name: null,
        path: 'it/blog/1',
      },
    ])
  })

  it('should return translated slugs for nested index', () => {
    const story = {parent_id: 123, full_slug: 'blog/index', lang: 'default'}
    const languages = ['en', 'it']
    expect(getTranslatedSlug(story, languages)).toStrictEqual([
      {
        lang: 'en',
        name: null,
        path: 'en/blog/index',
      },
      {
        lang: 'it',
        name: null,
        path: 'it/blog/index',
      },
    ])
  })

  it('should return a default slug for nested index', () => {
    const story = {parent_id: 123, full_slug: 'en/blog/index', lang: 'en'}
    const languages = ['en', 'it']
    expect(getTranslatedSlug(story, languages)).toStrictEqual([
      {
        lang: 'default',
        name: null,
        path: 'blog/index',
      },
      {
        lang: 'it',
        name: null,
        path: 'it/blog/index',
      },
    ])
  })
})
