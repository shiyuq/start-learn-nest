import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import {
  AllExceptionsFilter,
  AuthGuard,
  RolesGuard,
  TransformInterceptor,
} from '@/common';
import { AuthModule, TodoModule, UsersModule } from '@/modules';
import {
  ClassSerializerInterceptor,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { appConfig, mysqlConfig } from '@/config';

import { AllConfigType } from '@/config/config.type';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { jwtConstants } from '@/constants';

@Module({
  imports: [
    // 开发环境开启devtools，但是要收费，主要看依赖关系
    // import { DevtoolsModule } from '@nestjs/devtools-integration';
    // DevtoolsModule.register({
    //   http: process.env.NODE_ENV !== 'production',
    // }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? []
          : [`.env.${process.env.NODE_ENV || 'development'}`],
      load: [appConfig, mysqlConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AllConfigType>) => {
        const mysql = configService.getOrThrow('mysql', { infer: true });
        return {
          ...mysql,
          type: 'mysql',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: false,
        };
      },
    }),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
    TodoModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_PIPE,
      useFactory: () => {
        return new ValidationPipe({
          transform: true,
          whitelist: true,
          forbidNonWhitelisted: true,
          disableErrorMessages: false,
        });
      },
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
