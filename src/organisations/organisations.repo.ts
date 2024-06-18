import { Injectable } from '@nestjs/common';
import { Database } from '@core/modules/database/database.service';
import { Organisation } from './entities/organisations.entity';
import { Manual } from './entities/manuals.entity';
import { ExplanationVideos } from './entities/explanation-videos.entity';

@Injectable()
export class OrganisationsRepo {
  constructor(private readonly database: Database) {}

  async getOrganisations(name?: string): Promise<Organisation[]> {
    let query = 'SELECT * FROM organisations';
    const params = [];

    if (name) {
      query += ' WHERE name ILIKE $1';
      params.push(`%${name}%`);
    }

    const organisations = await this.database.query<Organisation>(
      query,
      params,
    );
    return organisations;
  }

  async getManualList(organizationId: string): Promise<Manual[]> {
    const query = `SELECT * FROM manuals WHERE $1 = ANY (manuals.organisations);`;
    const manual = await this.database.query<Manual>(query, [organizationId]);
    return manual;
  }

  async getExplanationVideoList(
    organizationId: string,
  ): Promise<ExplanationVideos[]> {
    const query = `SELECT * FROM explanation_videos WHERE $1 = ANY (explanation_videos.organisations);`;
    const explanationVideo = await this.database.query<ExplanationVideos>(
      query,
      [organizationId],
    );
    return explanationVideo;
  }
}
