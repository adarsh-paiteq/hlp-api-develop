import {
  Controller,
  Get,
  Query,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { TreatmentsService } from './treatments.service';
import { DownloadTreatmentFileQuery } from './dto/download-treatment-file.dto';
import { Response } from 'express';
import { I18nNextLanguage } from '@shared/decorators/language.decorator';
import { Roles } from '@shared/decorators/roles.decorator';
import { UserRoles } from '@users/users.dto';
import { JwtAuthGuard } from '@shared/guards/auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
@Controller('treatments')
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/download-file')
  async downloadTreatmentFile(
    @Res() response: Response,
    @Query() query: DownloadTreatmentFileQuery,
    @I18nNextLanguage() lang: string,
  ): Promise<StreamableFile> {
    return await this.treatmentsService.downloadTreatmentFile(
      response,
      query.treatmentId,
      lang,
    );
  }
}
