import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AllConfigType, appConfig, mongoConfig, mysqlConfig } from '@/config';
import {
  AllExceptionsFilter,
  AuthGuard,
  RolesGuard,
  TransformInterceptor,
} from '@/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ArticleModule, AuthModule, TodoModule, UsersModule } from '@/modules';
import {
  ClassSerializerInterceptor,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { GraphQLModule } from '@nestjs/graphql';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
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
      load: [appConfig, mysqlConfig, mongoConfig],
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
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AllConfigType>) => {
        const mongo = configService.getOrThrow('mongo', { infer: true });
        return {
          uri: mongo.uri,
        };
      },
    }),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['./**/*.graphql'], // 指定 schema 文件路径
      definitions: {
        path: join(process.cwd(), 'src/graphql.ts'),
      },
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    TodoModule,
    AuthModule,
    UsersModule,
    ArticleModule,
  ],
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
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
