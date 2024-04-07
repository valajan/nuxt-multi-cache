import { defineDriver } from 'unstorage'
import { H3Event, getQuery, getHeader } from 'h3'
import { defineMultiCacheOptions } from './../../src/runtime/serverOptions'

const customDriver = defineDriver(() => {
  let cache: Record<string, string> = {}
  return {
    hasItem(key: string) {
      return !!cache[key]
    },
    getItem(key: string) {
      if (key.includes('static_item_for_test')) {
        return JSON.stringify({ data: 'just_an_example_value' })
      }
      return cache[key]
    },
    setItem(key, value) {
      cache[key] = value
    },
    removeItem(key) {
      delete cache[key]
    },
    getKeys() {
      return Object.keys(cache)
    },
    clear() {
      cache = {}
    },
    dispose() {},
  }
})

function getCacheKeyPrefix(event: H3Event): string {
  const query = getQuery(event)
  if (query.language && typeof query.language === 'string') {
    return query.language
  }

  const acceptLanguage = getHeader(event, 'accept-language') || ''

  if (
    acceptLanguage &&
    typeof acceptLanguage === 'string' &&
    acceptLanguage.includes('de')
  ) {
    return 'de'
  }
  return 'en'
}

export default defineMultiCacheOptions({
  data: {
    storage: {
      driver: customDriver(),
    },
  },
  component: {},
  cacheKeyPrefix: (event: H3Event): Promise<string> => {
    return Promise.resolve(getCacheKeyPrefix(event))
  },
})
