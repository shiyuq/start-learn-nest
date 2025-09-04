import {
  Body,
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
} from '@nestjs/common';
// import { AuthGuard } from '../../../common/guard/auth.guard';
import { AuthService } from '../services/auth.service';
import { Public } from '../../../common/guard/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // 申明为公开接口，不需要认证
  @Public()
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  // 需要认证，使用AuthGuard，直接放到全局去了，这样就不需要在每个接口上都加上@UseGuards(AuthGuard)了
  // 这个适用于大部分接口都需要认证的情况，如果有的接口不需要认证，可以在接口上加上@Public()装饰器
  // @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }
}
