import { get, set } from 'lodash'

import {
  TranslationOptions,
  PathTranslationOptions,
  Path,
  TranslationService,
  PathType,
} from './types'
import {
  makeObject,
  paths,
  makeArray,
  removePropertyFromArrayRecursively,
} from './helpers'
import {
  yandex as yandexSupportedLocales,
  deeplTo as deeplSupportedToLocales,
  deeplFrom as deeplSupportedFromLocales,
} from './supported-locales'

import yandexTranslate from './translation-services/yandex'
import deeplTranslate from './translation-services/deepl'
import openAITranslate from './translation-services/openAI'

import { fromMarkdown } from 'mdast-util-from-markdown'
import { toMarkdown } from 'mdast-util-to-markdown'

const parseHtml = require('html2json')

export async function getTranslation(
  string: string,
  options: TranslationOptions
): Promise<string> {
  if (process.env.REACT_APP_USE_MOCK === 'true') {
    return `Translated ${string}`
  }

  switch (options.translationService) {
    case TranslationService.yandex: {
      return yandexTranslate(string, options)
    }
    case TranslationService.deepl:
    case TranslationService.deeplFree: {
      return deeplTranslate(string, options)
    }
    case TranslationService.openAI: {
      return openAITranslate(string, options)
    }
    default: {
      throw new Error('No translation service added in the settings')
    }
  }
}

export async function getRichTextTranslation(
  value: any[],
  options: TranslationOptions
): Promise<any[]> {
  const mappedValue = removePropertyFromArrayRecursively(value, ['itemId'])
  const allPaths = paths(mappedValue)
  let translatedArray = mappedValue

  for (const path of allPaths) {
    if (path.type === PathType.text) {
      const currentPath = path.path
      const currentString = get(translatedArray, currentPath)
      if (currentString) {
        const translatedString = await getTranslation(currentString, options)
        set(translatedArray, currentPath, translatedString)
      }
    }

    if (path.type === PathType.html) {
      const currentPath = path.path
      const currentString = get(translatedArray, currentPath)
      if (currentString) {
        const translatedString = await getHtmlTranslation(
          currentString,
          options
        )
        set(translatedArray, currentPath, translatedString)
      }
    }

    if (path.type === PathType.markdown) {
      const currentPath = path.path
      const currentString = get(translatedArray, currentPath)
      if (currentString) {
        const translatedString = await getMarkdownTranslation(
          currentString,
          options
        )
        set(translatedArray, currentPath, translatedString)
      }
    }

    if (path.type === PathType.structured_text) {
      const currentPath = path.path
      const currentArray = get(translatedArray, currentPath)
      if (currentArray) {
        const translatedString = await getStructuredTextTranslation(
          currentArray,
          options
        )
        set(translatedArray, currentPath, translatedString)
      }
    }

    if (path.type === PathType.structured_text_block) {
      const currentPath = path.path
      const currentObject: any = get(translatedArray, path.path)
      if (currentObject) {
        const translatedObject = await getRichTextTranslation(
          { ...currentObject, type: null, children: null },
          options
        )
        set(translatedArray, currentPath, {
          ...translatedObject,
          type: currentObject.type,
          children: currentObject.children,
        })
      }
    }

    if (path.type === PathType.seo) {
      const currentPath = path.path
      const currentValue = get(translatedArray, currentPath)
      if (currentValue) {
        const translatedString = await getSeoTranslation(currentValue, options)
        set(translatedArray, currentPath, translatedString)
      }
    }
  }

  return translatedArray
}

export async function getSeoTranslation(
  value: any,
  options: TranslationOptions
): Promise<any> {
  return {
    title: value.title ? await getTranslation(value.title, options) : '',
    description: value.description
      ? await getTranslation(value.description, options)
      : '',
    image: value?.image,
    twitter_card: value?.twitter_card,
  }
}

export async function getStructuredTextTranslation(
  value: any[],
  options: TranslationOptions
): Promise<any[]> {
  const mappedValue = removePropertyFromArrayRecursively(value, ['id'])
  const allPaths = paths(mappedValue)
  let translatedArray = mappedValue

  for (const path of allPaths) {
    if (path.type === PathType.text && path.key === 'text') {
      const currentPath = path.path
      const currentString = get(translatedArray, currentPath)
      if (currentString) {
        const translatedString = await getTranslation(currentString, options)
        set(translatedArray, currentPath, translatedString)
      }
    }

    if (path.type === PathType.structured_text) {
      const currentPath = path.path
      const currentArray = get(translatedArray, currentPath)
      if (currentArray) {
        const translatedString = await getStructuredTextTranslation(
          currentArray,
          options
        )
        set(translatedArray, currentPath, translatedString)
      }
    }

    if (path.type === PathType.structured_text_block) {
      const currentPath = path.path
      const currentObject: any = get(translatedArray, path.path)
      if (currentObject) {
        const translatedObject = await getRichTextTranslation(
          { ...currentObject, type: null, children: null },
          options
        )
        set(translatedArray, currentPath, {
          ...translatedObject,
          type: currentObject.type,
          children: currentObject.children,
        })
      }
    }
  }

  return translatedArray
}

export async function getHtmlTranslation(
  string: string,
  options: TranslationOptions
): Promise<string> {
  const json = parseHtml.html2json(string)
  const translatedArray = await getTranslationPerPath(json.child, {
    ...options,
    arrayKey: 'child',
    translatingKey: 'text',
  })
  const html = parseHtml.json2html({ ...json, child: translatedArray })
  return html
}

export async function getMarkdownTranslation(
  string: string,
  options: TranslationOptions
): Promise<string> {
  const json = fromMarkdown(string)
  const translatedArray = await getTranslationPerPath(json.children, {
    ...options,
    arrayKey: 'children',
    translatingKey: 'value',
  })
  const md = toMarkdown({ ...json, children: translatedArray })
  return md
}

export async function getTranslationPerPath(
  array: any[],
  options: PathTranslationOptions
): Promise<any[]> {
  const jsonObject = makeObject(array, options.arrayKey)
  const allPaths: Path[] = paths(jsonObject)

  for (const pathObject of allPaths) {
    const fullPath = pathObject.path
    if (pathObject.key === options.translatingKey && pathObject.value.trim()) {
      const currentString = get(jsonObject, fullPath)
      if (currentString) {
        const translatedString = await getTranslation(currentString, options)
        set(jsonObject, fullPath, translatedString)
      }
    }
  }

  const translatedArray = makeArray(jsonObject, options.arrayKey)
  return translatedArray
}

export function getSupportedToLocale(
  locale: string,
  translationService: TranslationService
): string {
  const localeLower = locale.toLowerCase()
  const indexOfDash = localeLower.indexOf('-')
  const localeStart =
    indexOfDash > 0 ? localeLower.substring(0, indexOfDash) : localeLower

  switch (translationService) {
    case TranslationService.yandex: {
      return localeStart
    }
    case TranslationService.deepl:
    case TranslationService.deeplFree: {
      switch (localeLower) {
        case 'en':
          return 'EN-US'
        case 'pt':
          return 'PT-PT'
        default:
          break
      }

      if (
        deeplSupportedToLocales
          .map((deeplLocale) => deeplLocale.toLowerCase())
          .includes(localeStart)
      ) {
        return localeStart.toUpperCase()
      }

      return locale.toUpperCase()
    }
  }

  return locale
}

export function getSupportedFromLocale(
  locale: string,
  translationService: TranslationService
): string {
  const localeLower = locale.toLowerCase()
  const indexOfDash = localeLower.indexOf('-')
  const localeStart =
    indexOfDash > 0 ? localeLower.substring(0, indexOfDash) : localeLower

  switch (translationService) {
    case TranslationService.yandex: {
      if (yandexSupportedLocales.includes(localeStart)) {
        return localeStart
      }

      return ''
    }
    case TranslationService.deepl:
    case TranslationService.deeplFree: {
      if (
        deeplSupportedFromLocales
          .map((deeplLocale) => deeplLocale.toLowerCase())
          .includes(localeStart)
      ) {
        return localeStart.toUpperCase()
      }

      return ''
    }
  }

  return locale
}
