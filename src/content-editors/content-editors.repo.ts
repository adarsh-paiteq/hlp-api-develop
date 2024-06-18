import { Injectable } from '@nestjs/common';
import { Database } from '../core/modules/database/database.service';
import { AddContentEditorInput } from './dto/add-content-editor.dto';
import { ContentEditor } from './entities/content-editor.entity';

@Injectable()
export class ContentEditorsRepo {
  constructor(private readonly database: Database) {}

  async getContentEditorByQuery(
    email: string,
    mobile_number: string,
  ): Promise<ContentEditor> {
    const query = `SELECT * FROM content_editors WHERE email=$1 OR mobile_number=$2`;
    const [editor] = await this.database.query<ContentEditor>(query, [
      email,
      mobile_number,
    ]);
    return editor;
  }

  async addContentEditor(
    editor: AddContentEditorInput,
  ): Promise<ContentEditor> {
    const query = `INSERT INTO content_editors (${Object.keys(editor).join(
      ',',
    )}) VALUES (${Object.keys(editor).map(
      (_, index) => `$${index + 1}`,
    )}) RETURNING *`;
    const [newEditor] = await this.database.query<ContentEditor>(
      query,
      Object.values(editor),
    );

    return newEditor;
  }

  async getEditorByEmail(email: string): Promise<ContentEditor> {
    const query = `SELECT * FROM content_editors WHERE email=$1`;
    const [editor] = await this.database.query<ContentEditor>(query, [email]);
    return editor;
  }

  async saveRefreshToken(id: string, token: string): Promise<ContentEditor> {
    const query = `UPDATE content_editors SET refresh_token=$1 WHERE id=$2 RETURNING *`;
    const [editor] = await this.database.query<ContentEditor>(query, [
      token,
      id,
    ]);
    return editor;
  }

  async getEditorById(id: string): Promise<ContentEditor> {
    const query = `SELECT * FROM content_editors WHERE id=$1`;
    const [editor] = await this.database.query<ContentEditor>(query, [id]);
    return editor;
  }
  async updateEditorPassword(
    id: string,
    password: string,
  ): Promise<ContentEditor> {
    const query = `UPDATE content_editors SET password=$1 WHERE id=$2 RETURNING *`;
    const [editor] = await this.database.query<ContentEditor>(query, [
      password,
      id,
    ]);
    return editor;
  }
}
