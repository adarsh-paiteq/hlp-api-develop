import { Inject, Injectable } from '@nestjs/common';
import { isArray } from 'class-validator';
import { QueryResult, QueryResultRow } from 'pg';
import { DatabaseConnection, DATABASE_CONNECTION } from './database.provider';
import { parse as parseUUID } from 'uuid';

@Injectable()
export class Database {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: DatabaseConnection,
  ) {}

  async query<T>(
    query: string,
    params?: (string | number | boolean | unknown)[],
  ): Promise<Array<T>> {
    const result = await this.db.query(query, params);
    return result.rows;
  }
  public async batchQuery<T extends QueryResultRow>(
    batchQuery: string,
  ): Promise<Array<Array<T>>> {
    const data: QueryResultRow = await this.db.query(batchQuery);
    if (!isArray(data)) return [data.rows];
    const results = data.map((result: QueryResult) => result.rows);
    return results;
  }
  public async batchQueryRaw<T extends QueryResultRow>(
    batchQueryRaw: string,
  ): Promise<QueryResultRow> {
    const data: QueryResult<T> = await this.db.query(batchQueryRaw, []);
    if (!isArray(data)) return [data];
    return data;
  }

  async sessionLock(id: number): Promise<void> {
    const query = `SELECT pg_advisory_lock($1)`;
    await this.db.query(query, [id]);
  }

  async sessionUnlock(id: number): Promise<void> {
    const query = `SELECT pg_advisory_unlock($1)`;
    await this.db.query(query, [id]);
  }

  async sessionLockByUUID(id: string): Promise<void> {
    const query = `SELECT pg_advisory_lock($1)`;
    await this.db.query(query, [this.UUIDToNumber(id)]);
  }

  async sessionUnlockByUUID(id: string): Promise<void> {
    const query = `SELECT pg_advisory_unlock($1)`;
    await this.db.query(query, [this.UUIDToNumber(id)]);
  }

  private UUIDToNumber(id: string): number {
    return parseUUID(id).reduce((a, b) => (a = b));
  }
}
