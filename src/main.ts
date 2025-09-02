import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { Reflector } from '@nestjs/core';
import { logger } from './middleware/logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(logger);
  const reflector = app.get(Reflector);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: false, // 自动转换类型，比如get请求的字符串 '1' 转换为数字 1
      disableErrorMessages: false, // 生产环境建议设置为 true
      whitelist: true, // 删除非白名单属性
      forbidNonWhitelisted: false, // true 报错，false 删除非白名单属性
    }),
  );
  /**
   * @Exclude() 装饰器修饰的属性不会出现在响应结果中
   * 1. 可以在类上使用 @UseInterceptors(ClassSerializerInterceptor)
   * 2. 可以在方法上使用 @UseInterceptors(ClassSerializerInterceptor)
   * 3. 也可以全局使用 app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));
   * 推荐使用第三种方式，全局使用，这样就不需要在每个类或方法上使用了
   */
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
