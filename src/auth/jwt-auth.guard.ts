import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Optional: Override canActivate for custom logic if needed
  // canActivate(
  //   context: ExecutionContext,
  // ): boolean | Promise<boolean> | Observable<boolean> {
  //   // Add custom logic here (e.g., checking for specific headers)
  //   return super.canActivate(context);
  // }

  // Optional: Override handleRequest for custom error handling or response modification
  // handleRequest(err, user, info, context, status) {
  //   if (err || !user) {
  //     // Customize error handling based on the info (e.g., TokenExpiredError)
  //     throw err || new UnauthorizedException();
  //   }
  //   return user; // This attaches the user to req.user
  // }
}
