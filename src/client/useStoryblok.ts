/* eslint-disable @typescript-eslint/no-explicit-any */

import StoryblokClient from 'storyblok-js-client'
import {useCallback, useEffect, useState} from 'react'

declare global {
  interface Window {
    StoryblokBridge: StoryblokClient
  }
}

const RESOLVE_RELATIONS = 'global-component.reference,blog.authors,blog.categories'

const storyblok = new StoryblokClient({accessToken: process.env.NEXT_PUBLIC_STORYBLOK_TOKEN})

export const useStoryblok = <StoryblokBlock, StoryblokStory, ConfigStory>(): {
  stories?: StoryblokStory[]
  story?: StoryblokStory
  config?: ConfigStory
  layout?: StoryblokBlock[]
} => {
  const [story, setStory] = useState<StoryblokStory>()
  const [config, setConfig] = useState<ConfigStory>()
  const [stories, setStories] = useState<StoryblokStory[]>([])
  const [layout, setLayout] = useState<StoryblokBlock[]>([])

  const initEventListeners = useCallback(async function () {
    const StoryblokBridge = window.StoryblokBridge as any

    if (typeof StoryblokBridge !== 'undefined') {
      const storyblokInstance = new StoryblokBridge({
        resolveRelations: RESOLVE_RELATIONS,
        preventClicks: true,
      })

      storyblokInstance.on(['published'], () => location.reload())

      storyblokInstance.on('input', (event: {story: unknown}) =>
        setStory(event.story as StoryblokStory)
      )

      try {
        const searchParams = new URLSearchParams(location.search)
        const language = searchParams.get('_storyblok_lang') || 'default'
        const slug = searchParams.get('slug') || ''
        const isPublishedPreview = !!searchParams.get('_storyblok_published')

        const stories = await storyblok.getAll('cdn/stories', {
          resolve_relations: RESOLVE_RELATIONS,
          version: isPublishedPreview ? 'published' : 'draft',
          language,
        })

        const story = stories.find(({full_slug}) => full_slug === slug)
        const config = stories.find(({content: {component}}) => component === 'config')
        const layout = stories
          .filter(({content: {component}}) => component === 'layout')
          .map(({content}) => content.blocks && content.blocks[0])
          .filter((block): block is StoryblokBlock => !!block)
          .map((block) => ({...block, _editable: undefined}))

        setStories(stories)
        setStory(story)
        setConfig(config)
        if (story.content.component !== 'layout') setLayout(layout)
      } catch (error) {
        console.error(error)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const existingScript = document.getElementById('storyblokBridge')
      if (!existingScript) {
        const script = document.createElement('script')
        script.src = '//app.storyblok.com/f/storyblok-v2-latest.js'
        script.id = 'storyblokBridge'
        document.body.appendChild(script)
        script.onload = () => initEventListeners()
      } else {
        initEventListeners()
      }
    }
  }, [initEventListeners])

  return {stories, story, config, layout}
}

export default useStoryblok
