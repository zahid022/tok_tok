import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ClsModule } from 'nestjs-cls';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './modules/auth/auth.module';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerModule } from '@nestjs-modules/mailer';
import { ScheduleModule } from '@nestjs/schedule';
import { JobModule } from './jobs/job.module';
import { UserModule } from './modules/user/user.module';
import { Request } from 'express';
import { ProfileModule } from './modules/user/profile/profile.module';
import { UploadModule } from './modules/upload/upload.module';
import { FollowModule } from './modules/follow/follow.module';
import { MediaModule } from './modules/media/media.module';
import { PostModule } from './modules/post/post.module';
import { StoryModule } from './modules/story/story.module';
import { HighlightModule } from './modules/highlight/highlight.module';
import { ReportModule } from './modules/report/report.module';
import { ChatModule } from './modules/chat/chat.module';
import { SocketModule } from './modules/socket/socket.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'postgres',
          url: config.get('DATABASE_URL'),
          entities: [join(__dirname, 'database/entity/*.entity.{ts,js}')],
          migrations: [join(__dirname, 'database/migrations/*.{ts,js}')],
          logging: true,
          synchronize: true,
        }
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: (cls, req: Request) => {
          cls.set('ip', req.ip);
        },
      },
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(config: ConfigService) {
        return {
          secret: config.get('JWT_SECRET'),
          signOptions: { expiresIn: '1d' },
        };
      },
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(config: ConfigService) {
        return {
          transport: {
            host: config.get('SMTP_HOST'),
            port: config.get('SMTP_PORT'),
            secure: false,
            auth: {
              user: config.get('SMTP_USER'),
              pass: config.get('SMTP_PASS'),
            },
          },
          defaults: {
            from: `"chat" <${config.get('SMTP_FROM')}>`,
          },
          template: {
            dir: __dirname + '/templates',
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        }
      },
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    JobModule,
    UserModule,
    ProfileModule,
    UploadModule,
    FollowModule,
    MediaModule,
    PostModule,
    StoryModule,
    HighlightModule,
    ReportModule,
    ChatModule,
    SocketModule,
    NotificationModule
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule { }
