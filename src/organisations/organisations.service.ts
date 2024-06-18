import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganisationsRepo } from './organisations.repo';
import { GetOrganisationsResponse } from './dto/get-organisations.dto';
import { TranslationService } from '@shared/services/translation/translation.service';
import { GetManualList } from './dto/get-manuals-list.dto';
import { GetExplanationVideosListResponse } from './dto/get-explanation-video-list.dto';
import { ExplanationVideos } from './entities/explanation-videos.entity';
import { Manual } from './entities/manuals.entity';

@Injectable()
export class OrganisationsService {
  constructor(
    private readonly organisationsRepo: OrganisationsRepo,
    private readonly translationService: TranslationService,
  ) {}

  async getOrganisations(name?: string): Promise<GetOrganisationsResponse> {
    const organisations = await this.organisationsRepo.getOrganisations(name);

    const organisationList = organisations.map((organisation) => {
      const organisationData = {
        id: organisation.id,
        name: organisation.name,
        is_default: organisation.is_default,
      };

      if (organisation.is_default) {
        organisationData.name = this.translationService.translate(
          `organisation.none_of_the_above`,
        );
      }

      return organisationData;
    });
    return { organisationList };
  }

  async getManualList(
    lang: string,
    organisationId?: string,
  ): Promise<GetManualList> {
    if (!organisationId) {
      throw new NotFoundException(`goals.organisation_not_found`);
    }
    const manuals = await this.organisationsRepo.getManualList(organisationId);
    const translatedManuals = this.translationService.getTranslations<Manual>(
      manuals,
      ['title', 'question', 'answer'],
      lang,
    );
    return { manuals: translatedManuals };
  }

  async getExplanationVideoList(
    lang: string,
    organisationId?: string,
  ): Promise<GetExplanationVideosListResponse> {
    if (!organisationId) {
      throw new NotFoundException(`goals.organisation_not_found`);
    }
    const explanationVideos =
      await this.organisationsRepo.getExplanationVideoList(organisationId);
    const translatedExplanationVideos =
      this.translationService.getTranslations<ExplanationVideos>(
        explanationVideos,
        ['title', 'description', 'short_description'],
        lang,
      );
    return {
      explanationVideos: translatedExplanationVideos,
    };
  }
}
