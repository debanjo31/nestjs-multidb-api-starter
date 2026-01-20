import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { Auth, AuthSchema, Media, MediaSchema } from '@shared/core';
import { MediaController } from './controller/media.controller';
import { MediaService } from './service/media.service';
import { JwtStrategy } from './strategies';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Media.name, schema: MediaSchema },
      { name: Auth.name, schema: AuthSchema },
    ]),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => {
        return {
          defaultStrategy: 'jwt',
          secret: config.get<string>('app.encryptionKey'),
          signOptions: { expiresIn: '60d' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService, JwtStrategy],
  exports: [MediaService],
})
export class MediaModule {}
