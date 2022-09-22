import {getHeight, getWidth, isOptimizable, storyblokLoader} from './Image.helpers'

describe('isOptimizable', () => {
  it('should return false when no src provided', () => {
    expect(isOptimizable()).toBe(false)
  })

  it('should return false when src is SVG', () => {
    const src = 'https://a.storyblok.com/f/166999/x/9c347bc64b/logo.svg'
    expect(isOptimizable(src)).toBe(false)
  })

  it('should return false when src is not from valid domain', () => {
    const src = 'https://not-a-valid-domain/f/166999/1920x1281/413ebadc89/fern-g25db02668_1920.jpeg'
    expect(isOptimizable(src)).toBe(false)
  })

  it('should return true when src is an image from a valid domain', () => {
    const src = 'https://a.storyblok.com/f/166999/1920x1281/413ebadc89/fern-g25db02668_1920.jpeg'
    expect(isOptimizable(src)).toBe(true)
  })
})

describe('getWidth', () => {
  it('should return width when provided', () => {
    const src = 'https://a.storyblok.com/f/166999/1920x1281/413ebadc89/fern-g25db02668_1920.jpeg'
    expect(getWidth(src)).toBe(1920)
  })

  it('should return throw when width is missing', () => {
    const src = 'https://a.storyblok.com/f/166999/x/9c347bc64b/logo.svg'
    expect(() => {
      getWidth(src)
    }).toThrow()
  })
})

describe('getHeight', () => {
  it('should return width when provided', () => {
    const src = 'https://a.storyblok.com/f/166999/1920x1281/413ebadc89/fern-g25db02668_1920.jpeg'
    expect(getHeight(src)).toBe(1281)
  })

  it('should return throw when width is missing', () => {
    const src = 'https://a.storyblok.com/f/166999/x/9c347bc64b/logo.svg'
    expect(() => {
      getHeight(src)
    }).toThrow()
  })
})

describe('storyblokLoader', () => {
  it('should throw if image is not optimizable', () => {
    const src = 'https://a.storyblok.com/f/166999/x/9c347bc64b/logo.svg'
    expect(() => {
      storyblokLoader({src, width: 2000})
    }).toThrow()
  })
  it('should add width', () => {
    const src = 'https://a.storyblok.com/f/166999/1920x1281/413ebadc89/fern-g25db02668_1920.jpeg'
    expect(storyblokLoader({src, width: 2000})).toContain('/m/2000x0')
  })

  it('should use smart crop', () => {
    const src = 'https://a.storyblok.com/f/166999/1920x1281/413ebadc89/fern-g25db02668_1920.jpeg'
    expect(storyblokLoader({src, width: 2000})).toContain('/smart')
  })

  it('should add quality', () => {
    const src = 'https://a.storyblok.com/f/166999/1920x1281/413ebadc89/fern-g25db02668_1920.jpeg'
    expect(storyblokLoader({src, width: 2000, quality: 25})).toContain('filters:quality(25)')
  })

  it('should use 75 as default quality', () => {
    const src = 'https://a.storyblok.com/f/166999/1920x1281/413ebadc89/fern-g25db02668_1920.jpeg'
    expect(storyblokLoader({src, width: 2000})).toContain('filters:quality(75)')
  })
})
