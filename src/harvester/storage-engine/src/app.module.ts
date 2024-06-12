import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StoreController } from './store.controller';

@Module({
  imports: [],
  controllers: [AppController, StoreController],
  providers: [AppService],
})
export class AppModule { }
