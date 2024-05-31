import {
  DatoFieldType,
  Editor,
  TranslationFormat,
  TranslationService,
  SettingOption,
} from './types'

export const fieldsOptions: SettingOption<DatoFieldType>[] = [
  { label: 'String fields', value: DatoFieldType.stringField },
  { label: 'Text fields', value: DatoFieldType.textField },
  { label: 'Structured text fields', value: DatoFieldType.structuredTextField },
  { label: 'Modular content fields', value: DatoFieldType.richTextField },
  { label: 'SEO fields', value: DatoFieldType.seo },
  { label: 'Slug fields', value: DatoFieldType.slug },
]

export const translationServiceOptions: SettingOption<TranslationService>[] = [
  { label: 'OpenAI', value: TranslationService.openAI },
]

export const translationFormats = {
  [Editor.html]: TranslationFormat.html,
  [Editor.markdown]: TranslationFormat.markdown,
  [Editor.singleLine]: TranslationFormat.plain,
  [Editor.structuredText]: TranslationFormat.structuredText,
  [Editor.richText]: TranslationFormat.richText,
  [Editor.textarea]: TranslationFormat.plain,
  [Editor.seo]: TranslationFormat.seo,
  [Editor.slug]: TranslationFormat.slug,
}
