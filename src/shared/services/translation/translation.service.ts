import { Inject, Injectable } from '@nestjs/common';
import { I18N, i18n } from '@core/modules/i18n-next';
import { ClsService } from 'nestjs-cls';
import { Translation } from '@utils/utils.dto';

@Injectable()
export class TranslationService {
  constructor(
    @Inject(I18N) private readonly i18Next: i18n,
    private readonly clsService: ClsService,
  ) {}

  translate(
    key: string,
    data: Record<string, unknown> = {},
    lng?: string,
  ): string {
    const lang = lng ?? this.clsService.get('lng');
    return this.i18Next.t(key, { ...data, lng: lang });
  }
  isExists(key: string): boolean {
    return this.i18Next.exists(key);
  }
  lng(): string {
    return this.clsService.get('lng') ?? this.i18Next.language;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getTranslations<T extends { translations?: any }>(
    data: T[],
    keys: (keyof T)[],
    lng?: string,
  ): T[] {
    const lang = lng ?? this.lng();
    const translatedData = data.map((item) => {
      const translations = item['translations'];
      const langTranslations = translations?.[lang];
      const newItem = { ...item }; //  created a shallow copy so it won't modify original object
      if (langTranslations) {
        keys.forEach((key) => {
          if (newItem[key]) {
            const translatedValue = langTranslations[key];
            if (translatedValue) {
              newItem[key] = translatedValue;
            }
          }
        });
      }
      return newItem as T;
    });

    return translatedData;
  }

  /**
   *  * @description
   * This function is used to retrieve translations for data objects.
   * first it will get the translations for English and Dutch from data objects,
   * then it will extract the translations for the given translation keys from the i18n json files.
   * @param data Array of objects containing translations.
   * @param dataKeys Keys for translations within data objects.
   * @param translationKeys Keys for translations from json file.
   * @returns Object containing English and Dutch translations.
   */
  getDataTranslations<T extends { translations?: unknown }>(
    data: T[],
    dataKeys: (keyof T)[],
    translationKeys: string[],
  ): Translation {
    const translations: Translation = {
      en: {},
      nl: {},
    };

    const [translatedDataEn] = this.getTranslations(data, dataKeys, 'en');
    const [translatedDataNl] = this.getTranslations<T>(data, dataKeys, 'nl');

    for (const translationKey of translationKeys) {
      //extract the field name (example: title/body) from the translation key which will be stored in the translations object
      const key = translationKey.split('.')[1];
      if (key) {
        const translatedValueEn = this.translate(
          translationKey,
          translatedDataEn,
          'en',
        );
        const translatedValueNl = this.translate(
          translationKey,
          translatedDataNl,
          'nl',
        );

        translations.en[key] = translatedValueEn || '';
        translations.nl[key] = translatedValueNl || '';
      }
    }

    return translations;
  }

  getEnglishAndDutchTranslations(
    translationKeys: string[],
    data?: Record<string, unknown>,
  ): Translation {
    const translations: Translation = {
      en: {},
      nl: {},
    };

    for (const translationKey of translationKeys) {
      //extract the field name (example: title/body) from the translation key which will be stored in the translations object
      const key = translationKey.split('.')[1];
      if (key) {
        const translatedValueEn = this.translate(translationKey, data, 'en');
        const translatedValueNl = this.translate(translationKey, data, 'nl');

        translations.en[key] = translatedValueEn || '';
        translations.nl[key] = translatedValueNl || '';
      }
    }

    return translations;
  }
}
