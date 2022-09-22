export const makeEditable = (_editable?: string | null): Record<string, string> => {
  if (!_editable) return {}

  const options = JSON.parse(_editable.replace(/^<!--#storyblok#/, '').replace(/-->$/, ''))

  return {
    'data-blok-c': JSON.stringify(options),
    'data-blok-uid': options.id + '-' + options.uid,
  }
}
