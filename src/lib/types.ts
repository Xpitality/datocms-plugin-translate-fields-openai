export enum DatoFieldType {
  stringField = 'string',
  textField = 'text',
  richTextField = 'rich_text',
  structuredTextField = 'structured_text',
  seo = 'seo',
  slug = 'slug',
}

export enum Editor {
  html = 'wysiwyg',
  markdown = 'markdown',
  singleLine = 'single_line',
  structuredText = 'structured_text',
  richText = 'rich_text',
  textarea = 'textarea',
  seo = 'seo',
  slug = 'slug',
}

export enum TranslationFormat {
  html = 'html',
  markdown = 'markdown',
  structuredText = 'structured_text',
  richText = 'rich_text',
  plain = 'plain',
  seo = 'seo',
  slug = 'slug',
}

export enum TranslationService {
  openAI = 'openAI',
  mock = 'mock',
}

export enum TranslationServiceKey {
  openAIKey = 'openAIApiKey',
  mockKey = 'mockApiKey',
}

export enum OpenAIDefaultValues {
  model = 'gpt-4o',
  temperature = 0,
  maxTokens = 100,
  topP = 0,
}

export type Parameters = {
  translationService?: SettingOption<TranslationService>
  model?: SettingOption<string>
  temperature?: number
  maxTokens?: number
  topP?: number
  [TranslationServiceKey.openAIKey]?: string
  [TranslationServiceKey.mockKey]?: string
}

export interface GlobalParameters extends Parameters {
  autoApply?: boolean
  fieldsToEnable?: SettingOption<DatoFieldType>[]
}

export type SettingOption<T> = {
  value: T
  label: string
}

export type TranslationOptions = {
  fromLocale: string
  toLocale: string
  format: TranslationFormat
  translationService: TranslationService
  apiKey: string
  openAIOptions: {
    model: string
    temperature: number
    maxTokens: number
    topP: number
  }
}

export type Path = {
  path: string
  value: string
  key: string
  type?: PathType
}

export enum PathType {
  text = 'text',
  structured_text = 'structured_text',
  structured_text_block = 'structured_text_block',
  structured_text_inline_item = 'structured_text_inline_item',
  structured_text_code = 'structured_text_code',
  media = 'media',
  id = 'id',
  number = 'number',
  date = 'date',
  boolean = 'boolean',
  color = 'color',
  html = 'html',
  markdown = 'markdown',
  json = 'json',
  seo = 'seo',
  slug = 'slug',
  meta = 'meta',
}

export type Models = Array<{ id: string }>
