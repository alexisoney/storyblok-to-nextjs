import {apiPlugin, StoriesParams, StoryblokClient, storyblokInit, StoryData} from '@storyblok/js'
import Cache from 'file-system-cache'
import {GetStaticPaths, GetStaticPathsResult, GetStaticProps} from 'next'
import urljoin from 'url-join'

type Config = {
  token: string
  languages?: string[]
  resolve_relations?: string
  excluding_slugs?: string
  version?: StoriesParams['version']
}

class Storyblok {
  storyblokApi: StoryblokClient
  languages: string[]
  resolve_relations: string | undefined
  excluding_slugs: string | undefined
  version: StoriesParams['version']

  FSCache = Cache()
  FSCacheStoriesKey = 'stories'

  constructor(config: Config) {
    this.storyblokApi = (() => {
      const {storyblokApi} = storyblokInit({
        accessToken: config.token,
        use: [apiPlugin],
      })

      if (!storyblokApi) throw Error('storyblokApi undefined')

      return storyblokApi
    })()

    this.languages = config.languages || []
    this.resolve_relations = config.resolve_relations || 'global-component.reference'
    this.excluding_slugs = config.excluding_slugs || '__config/*'
    this.version =
      config.version || process.env.STORYBLOK_VERSION === 'draft' ? 'draft' : 'published'
  }

  getStaticPaths: GetStaticPaths = async () => {
    const stories = await this.getStories()
    const paths: GetStaticPathsResult['paths'] = []

    stories.forEach((story) => {
      const slug = story.full_slug.replace('index', '').split('/')
      paths.push({params: {slug: slug}})
    })

    return {paths, fallback: false}
  }

  getStaticProps: GetStaticProps = async ({params}) => {
    if (params) {
      let language: string | undefined
      let slug: string

      if (Array.isArray(params.slug)) {
        if (this.languages.includes(params.slug[0])) {
          language = params.slug[0]
          if (params.slug.length === 1) {
            slug = urljoin(language, 'index')
          } else {
            slug = params.slug.join('/')
          }
        } else {
          slug = params.slug.join('/')
        }
      } else if (typeof params.slug === 'undefined') {
        slug = 'index'
      } else {
        throw Error('getStaticProps: params.slug is not an array')
      }

      const story = await this.getStory(slug)

      const translated_slugs: NonNullable<StoryData['translated_slugs']> = this.languages
        .map((lang) => ({
          lang,
          name: null,
          path: urljoin(lang, slug).replace('index', ''),
        }))
        .concat({
          lang: 'default',
          name: null,
          path: slug.replace('index', ''),
        })
        .filter(({lang}) => lang !== (language || 'default'))

      return {
        props: {
          ...story,
          translated_slugs,
        },
      }
    }
    throw Error('getStaticProps: No params')
  }

  getStories = async (): Promise<StoryData[]> => {
    const cachedStories = await this.FSCache.get(this.FSCacheStoriesKey)

    let stories: StoryData[] = []

    if (cachedStories) {
      stories = cachedStories
    } else {
      for (const language of ['default', ...this.languages]) {
        const allStories = await this.storyblokApi.getAll('cdn/stories', {
          resolve_relations: this.resolve_relations,
          version: this.version,
          excluding_slugs: this.excluding_slugs,
          language,
        })

        stories = stories.concat(allStories)
      }
      this.FSCache.set(this.FSCacheStoriesKey, stories)
    }

    return stories
  }

  getStory = async (slug: string) => {
    const stories: StoryData[] = await this.FSCache.get(this.FSCacheStoriesKey)

    if (stories) {
      const story = stories.find(({full_slug}) => slug === full_slug)

      if (story) {
        return story
      } else {
        throw Error('getStaticProps: story not found')
      }
    } else {
      throw Error('getStaticProps: cache is empty')
    }
  }

  getConfig = async <Type>(slug = '__config/config'): Promise<Type> => {
    const {data} = await this.storyblokApi.get(`cdn/stories/${slug}`, {
      version: this.version,
    })
    return data.story
  }
}

export default Storyblok
