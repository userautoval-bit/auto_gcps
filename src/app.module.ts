import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GcpsModule } from './nfe/gcps.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProdService } from './data/prod.service';

@Module({
    imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Torna as variáveis de ambiente acessíveis em toda a aplicação
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useClass: ProdService, 
      imports: [ConfigModule],
    }),
    GcpsModule,
  ],
  controllers: [AppController],
  providers: [],
})

export class AppModule {}
