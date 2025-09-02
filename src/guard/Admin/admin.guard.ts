import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    // console.log(request);
    const user = request.payload?.user;
    // console.log(user);
    if (user.role === 'Admin') {
      return true;
    }
    throw new ForbiddenException('access denied');
  }
}
