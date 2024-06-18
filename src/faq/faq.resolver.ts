import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { Roles } from '@shared/decorators/roles.decorator';
import { JwtAuthGuard } from '@shared/guards/auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { UserRoles } from '../users/users.dto';
import { FaqArgs, FaqCategoryArgs } from './dto/faq.dto';
import { FaqCategory } from './entities/faq-category.entity';
import { Faq } from './entities/faq.entity';
import { FaqService } from './faq.service';
import { I18nNextLanguage } from '@shared/decorators/language.decorator';
import { GetUser } from '@shared/decorators/user.decorator';
import { LoggedInUser } from '@shared/auth/jwt.strategy';

@Resolver()
export class FaqResolver {
  constructor(private readonly faqService: FaqService) {}

  @Query(() => Faq, { name: 'getFAQDetails' })
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getFAQDetails(
    @Args() args: FaqArgs,
    @I18nNextLanguage() lang: string,
  ): Promise<Faq> {
    return this.faqService.getFAQDetails(args.faqId, lang);
  }

  @Query(() => [FaqCategory], { name: 'getFaqCategories' })
  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getFaqCategories(
    @GetUser() user: LoggedInUser,
    @I18nNextLanguage() lang: string,
  ): Promise<FaqCategory[]> {
    return this.faqService.getFaqCategories(lang, user.organization_id);
  }

  @Query(() => [Faq], { name: 'getFAQList' })
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getFAQList(
    @Args() args: FaqCategoryArgs,
    @I18nNextLanguage() lang: string,
  ): Promise<Faq[]> {
    return this.faqService.getFAQList(args.faqCategoryId, lang);
  }
}
