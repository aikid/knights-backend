import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Env } from './env'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get<ConfigService<Env, true>>(ConfigService)
  const port = configService.get('PORT',{ infer: true })

  const config = new DocumentBuilder()
    .setTitle('Knights API')
    .setDescription('API para gerenciamento de cavaleiros')
    .setVersion('1.0')
    .addTag('knights')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  // Habilita CORS
  app.enableCors({
    origin: '*', // Permite qualquer origem (ajuste conforme necessário)
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  await app.listen(port)
}
bootstrap()
