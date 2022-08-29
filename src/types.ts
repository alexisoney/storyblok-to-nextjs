export {StoryblokComponent as Block, StoryData as Story} from 'storyblok-js-client'

export type StoryblokAsset =
  | ''
  | {
      alt?: '' | string
      filename: '' | string | null
    }

export type StoryblokLink =
  | ''
  | {
      linktype: 'url'
      url: string
    }
  | {
      linktype: 'story'
      story?: {
        url: string
      }
    }

type StoryblokRichtextContent = {
  type: string
  text?: string
  attrs?: unknown
  marks?: unknown[]
  content?: StoryblokRichtextContent[]
}

export type StoryblokRichtext =
  | ''
  | {
      type: 'doc'
      content: StoryblokRichtextContent[]
    }
