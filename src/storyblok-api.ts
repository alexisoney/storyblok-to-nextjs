import {apiPlugin, StoryblokClient, storyblokInit} from '@storyblok/js'

type Config = {
  token: string
}

class Storyblok {
  storyblokApi: StoryblokClient

  constructor(config: Config) {
    this.storyblokApi = (() => {
      const {storyblokApi} = storyblokInit({
        accessToken: config.token,
        use: [apiPlugin],
      })

      if (!storyblokApi) throw Error('storyblokApi undefined')

      return storyblokApi
    })()
  }
}

export default Storyblok
