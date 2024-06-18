import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../shared/auth/auth.service';
import { GenerateTokens } from '../users/users.model';
import { ContentEditorsRepo } from './content-editors.repo';
import { AddContentEditorInput } from './dto/add-content-editor.dto';
import { ContentEditorLoginArgs } from './dto/login-content-editor.dto';
import { ContentEditor } from './entities/content-editor.entity';

@Injectable()
export class ContentEditorsService {
  constructor(
    private readonly contentEditorsRepo: ContentEditorsRepo,
    private readonly authService: AuthService,
  ) {}

  async addContentEditor(
    addEditor: AddContentEditorInput,
  ): Promise<ContentEditor> {
    const existingEditor =
      await this.contentEditorsRepo.getContentEditorByQuery(
        addEditor.email,
        addEditor.mobile_number,
      );
    if (existingEditor) {
      throw new ConflictException(
        `content-editors.already_exist_mobile_and_email`,
      );
    }
    const hashedPassword = this.authService.hashPassword(addEditor.password);
    const newEditor = { ...addEditor, password: hashedPassword };
    const savedEditor = await this.contentEditorsRepo.addContentEditor(
      newEditor,
    );
    return savedEditor;
  }

  async login(args: ContentEditorLoginArgs): Promise<GenerateTokens> {
    const editor = await this.contentEditorsRepo.getEditorByEmail(args.email);
    if (!editor.status) {
      throw new UnauthorizedException(`content-editors.blocked_account`);
    }
    const isPasswordValid = this.authService.compareHash(
      args.password,
      editor.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }
    const tokens = await this.authService.getTokens(editor);
    await this.contentEditorsRepo.saveRefreshToken(
      editor.id,
      tokens.refresh_token,
    );
    return tokens;
  }

  async refreshToken(id: string, token: string): Promise<GenerateTokens> {
    const editor = await this.contentEditorsRepo.getEditorById(id);
    const isValid = String(editor.refresh_token) !== String(token);
    if (isValid || !editor) {
      throw new UnauthorizedException(`content-editors.invalid_token`);
    }
    const tokens = await this.authService.getTokens(editor);
    await this.contentEditorsRepo.saveRefreshToken(
      editor.id,
      tokens.refresh_token,
    );
    return tokens;
  }
}
