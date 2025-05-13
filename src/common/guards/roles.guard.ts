import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role as PrismaRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from '../../auth/jwt.strategy'; // Adjust path as needed

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<PrismaRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // If no roles are required, access is granted
    }

    const { user } = context.switchToHttp().getRequest<{ user: JwtPayload }>();

    if (!user || !user.role) {
      return false; // No user or user role in JWT payload
    }

    return requiredRoles.some((role) => user.role === role);
  }
} 