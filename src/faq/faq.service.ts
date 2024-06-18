import { Injectable, NotFoundException } from '@nestjs/common';
import { FaqCategory } from './entities/faq-category.entity';
import { Faq } from './entities/faq.entity';
import { FaqRepo } from './faq.repo';
import { TranslationService } from '@shared/services/translation/translation.service';

@Injectable()
export class FaqService {
  constructor(
    private readonly faqRepo: FaqRepo,
    private readonly translationsService: TranslationService,
  ) {}

  async getFAQDetails(faqId: string, lang: string): Promise<Faq> {
    const faqDetails = await this.faqRepo.getFAQDetails(faqId);
    if (!faqDetails) {
      throw new NotFoundException(`faq.faq_not_found`);
    }
    const [translatedFaqDetails] =
      this.translationsService.getTranslations<Faq>(
        [faqDetails],
        ['title', 'question', 'answer'],
        lang,
      );

    return translatedFaqDetails;
  }

  async getFaqCategories(
    lang: string,
    organisationId?: string,
  ): Promise<FaqCategory[]> {
    if (!organisationId) {
      throw new NotFoundException(`goals.organisation_not_found`);
    }
    const faqCategories = await this.faqRepo.getFaqCategories(organisationId);
    const translatedFaqCategories =
      this.translationsService.getTranslations<FaqCategory>(
        faqCategories,
        ['title'],
        lang,
      );
    return translatedFaqCategories;
  }

  async getFAQList(faqCategoryId: string, lang: string): Promise<Faq[]> {
    const faqList = await this.faqRepo.getFAQList(faqCategoryId);
    const translatedFaqList = this.translationsService.getTranslations<Faq>(
      faqList,
      ['title', 'question'],
      lang,
    );
    if (!faqList) {
      throw new NotFoundException(`faq.faq_list_not_found`);
    }
    return translatedFaqList;
  }
}
