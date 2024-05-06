import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post()
  getHello(): number {
    // Status ok. Root does not serve any siginificant purpose.
    return 1;
  }

  @Get()
  dontUseGet(): string {
    return "Please use POST method to access the API.";
  }
}
