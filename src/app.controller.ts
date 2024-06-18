import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './shared/guards/auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/greet')
  @UseGuards(JwtAuthGuard)
  async greet(@Body('name') name: string) {
    return { name: `Hello ${name}` };
  }
}
