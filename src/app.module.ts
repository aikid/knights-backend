import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaService } from './prisma/prisma.service'
import { KnightController } from './controllers/knight.controller'
import { envSchema } from './env'

@Module({
  imports: [ConfigModule.forRoot({
    validate: env =>envSchema.parse(env),
    isGlobal: true,
  })],
  controllers: [KnightController],
  providers: [PrismaService],
})
export class AppModule {}
