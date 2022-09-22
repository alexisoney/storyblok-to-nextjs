import {StoryblokRichtext} from '../types'

export function isEmptyRichtext(richtext?: StoryblokRichtext): boolean {
  if (richtext === undefined || richtext === '' || !richtext.content) return true
  if (richtext.content.find((i) => i.content || i.type === 'blok') === undefined) return true
  return false
}
