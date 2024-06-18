import { Injectable } from '@nestjs/common';
import { Database } from '../core/modules/database/database.service';
import { FaqCategory } from './entities/faq-category.entity';
import { Faq } from './entities/faq.entity';

@Injectable()
export class FaqRepo {
  constructor(private readonly database: Database) {}

  async getFAQDetails(faqId: string): Promise<Faq> {
    const query = `
        SELECT * 
        FROM faq
        WHERE id = $1;
      `;
    const [data] = await this.database.query<Faq>(query, [faqId]);
    return data;
  }

  async getFaqCategories(organizationId: string): Promise<FaqCategory[]> {
    const query = `
    SELECT * FROM faq_category WHERE $1 = ANY (faq_category.organisations);
    `;
    const data = await this.database.query<FaqCategory>(query, [
      organizationId,
    ]);
    return data;
  }

  async getFAQList(faqCategoryId: string): Promise<Faq[]> {
    const query = `SELECT * FROM faq WHERE faq.faq_category_id = $1`;
    const faqList = await this.database.query<Faq>(query, [faqCategoryId]);
    return faqList;
  }
}
