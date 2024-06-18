import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { GenerateTokens } from '../users/users.model';
import { ContentEditorsService } from './content-editors.service';
import { AddContentEditorInput } from './dto/add-content-editor.dto';
import { ContentEditorLoginArgs } from './dto/login-content-editor.dto';
import { ContentEditor } from './entities/content-editor.entity';

@Resolver()
export class ContentEditorsResolver {
  constructor(private readonly contentCreatorsService: ContentEditorsService) {}

  @Mutation(() => ContentEditor, { name: 'AddContentEditor' })
  async addContentEditor(
    @Args('editor') editor: AddContentEditorInput,
  ): Promise<ContentEditor> {
    return this.contentCreatorsService.addContentEditor(editor);
  }

  @Mutation(() => GenerateTokens, { name: 'contentEditorLogin' })
  async contentEditorLogin(
    @Args() args: ContentEditorLoginArgs,
  ): Promise<GenerateTokens> {
    return this.contentCreatorsService.login(args);
  }
}
