import StoryblokClient, {StoriesParams, StoryData} from 'storyblok-js-client'
import Cache from 'file-system-cache'
import {
  GetStaticPaths,
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next'

type Config = {
  accessToken?: string
  version?: string
  languages?: string[]
  resolve_relations?: string
  excluding_slugs?: string
}

class Storyblok {
  storyblokApi: StoryblokClient
  languages: string[]
  resolve_relations: string | undefined
  excluding_slugs: string | undefined
  version: StoriesParams['version']

  FSCache = Cache()
  FSCacheStoriesKey = 'stories'
  FSCacheConfigKey = 'config'

  constructor(config: Config) {
    if (!config.accessToken) {
      throw Error('accessToken is missing')
    }

    if (config.version !== 'draft' && config.version !== 'published') {
      throw Error('version must be draft or published')
    }

    this.storyblokApi = new StoryblokClient({
      accessToken: config.accessToken,
    })

    this.version = config.version
    this.languages = config.languages || []
    this.resolve_relations = config.resolve_relations || 'global-component.reference'
    this.excluding_slugs = config.excluding_slugs || '__config/*'
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

  getStaticProps = async <StoryType extends StoryData, ConfigType extends StoryData>({
    params,
  }: GetStaticPropsContext): Promise<
    GetStaticPropsResult<{
      story: StoryType
      stories: StoryType[]
      config: ConfigType
    }>
  > => {
    if (params) {
      let language: string | undefined
      let slug: string

      if (Array.isArray(params.slug)) {
        if (this.languages.includes(params.slug[0])) {
          language = params.slug[0]
          if (params.slug.length === 1) {
            slug = [language, 'index'].join('/')
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

      const story = await this.getStory<StoryType>(slug)

      const translated_slugs: NonNullable<StoryData['translated_slugs']> = this.languages
        .map((lang) => ({
          lang,
          name: null,
          path: [lang, slug].join('/').replace('index', ''),
        }))
        .concat({
          lang: 'default',
          name: null,
          path: slug.replace('index', ''),
        })
        .filter(({lang}) => lang !== (language || 'default'))

      const stories = await this.getStories<StoryType>()

      const config = await this.getConfig<ConfigType>()

      return {
        props: {
          story: {
            ...story,
            translated_slugs,
          },
          stories,
          config,
        },
      }
    }
    throw Error('getStaticProps: No params')
  }

  getStories = async <StoryType extends StoryData>(): Promise<StoryType[]> => {
    const cachedStories = await this.FSCache.get(this.FSCacheStoriesKey)

    let stories: StoryType[] = []

    if (cachedStories) {
      stories = cachedStories
    } else {
      for (const language of ['default', ...this.languages]) {
        const allStories = await this.storyblokApi.getAll('cdn/stories', {
          resolve_relations: this.resolve_relations,
          resolve_links: 'url',
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

  getStory = async <StoryType extends StoryData>(slug: string): Promise<StoryType> => {
    const stories: StoryType[] = await this.FSCache.get(this.FSCacheStoriesKey)

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

  getConfig = async <StoryType extends StoryData>(slug = '__config/config'): Promise<StoryType> => {
    const cachedConfig = await this.FSCache.get(this.FSCacheConfigKey)

    if (cachedConfig) {
      return cachedConfig
    } else {
      const {data} = await this.storyblokApi.get(`cdn/stories/${slug}`, {
        version: this.version,
      })

      const config = data.story

      this.FSCache.set(this.FSCacheConfigKey, config)

      return config
    }
  }
}

export default Storyblok
