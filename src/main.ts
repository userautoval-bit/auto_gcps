import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const config = new DocumentBuilder()
    .setTitle('Gestão CPS - Faturamento')
    .setDescription('API de controle financeiro e notas fiscais')
    .setVersion('1.0')
    .addTag('gcps')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/swagger', app, document);

  app.enableCors(
    {
      origin: ["http://localhost:5173", ""], // Domínios que podem acessar o backend
      methods: "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      allowedHeaders: "Content-Type, Authorization",
      credentials: true,
    }
  )
 
  await app.listen(process.env.PORT || 4000);
}
bootstrap();
