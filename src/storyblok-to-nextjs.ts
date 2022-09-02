import StoryblokClient, {StoriesParams, StoryblokComponent, StoryData} from 'storyblok-js-client'
import Cache from 'file-system-cache'
import {
  GetStaticPaths,
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next'
import {getNextSlug, getTranslatedSlug, normalizeUrl, toStoryblokSlug} from './helpers'
import urljoin from 'url-join'

type Config = {
  accessToken?: string
  version?: string
  languages?: string[]
  resolve_relations?: string
}

class Storyblok {
  storyblokApi: StoryblokClient
  languages: string[]
  resolve_relations: string | undefined
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
  }

  getStaticPaths: GetStaticPaths = async () => {
    const stories = await this.getStories()
    const paths: GetStaticPathsResult['paths'] = []

    stories.forEach((story) => {
      const slug = getNextSlug(story)
      if (slug) paths.push({params: {slug}})
    })

    return {paths, fallback: false}
  }

  getStaticProps = async <
    StoryblokBlock extends StoryblokComponent<string>,
    StoryblokStory extends StoryData & {content: {blocks?: StoryblokBlock[]}},
    ConfigStory extends StoryData
  >({
    params,
  }: GetStaticPropsContext): Promise<
    GetStaticPropsResult<{
      stories?: StoryblokStory[]
      story?: StoryblokStory
      config?: ConfigStory
      layout?: StoryblokBlock[]
    }>
  > => {
    if (params) {
      const stories = await this.getStories<StoryblokStory>()

      const storyblokSlug = toStoryblokSlug(this.languages, params.slug)
      const story = await this.getStory<StoryblokStory>(storyblokSlug)

      story.full_slug = normalizeUrl([story.full_slug], story)
      story.translated_slugs = getTranslatedSlug(story, this.languages)

      const config = stories.find(({content: {component}}) => component === 'config') as
        | ConfigStory
        | undefined

      const layout = stories
        .filter(({full_slug}) => {
          const basePath = story.lang === 'default' ? '' : story.lang
          return full_slug.startsWith(urljoin(basePath, '__config/layouts'))
        })
        .map(({content}) => content.blocks && content.blocks[0])
        .filter((block): block is StoryblokBlock => !!block)

      return {
        props: {
          story,
          stories,
          config,
          layout,
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
      const story = stories.find(({full_slug}) => new RegExp(`^${slug}/?$`).test(full_slug))

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
