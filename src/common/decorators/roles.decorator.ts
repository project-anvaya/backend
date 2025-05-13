import { SetMetadata } from '@nestjs/common';
import { Role as PrismaRole } from '@prisma/client'; // Assuming your Prisma enum is named Role

export const ROLES_KEY = 'roles';
export const Roles = (...roles: PrismaRole[]) => SetMetadata(ROLES_KEY, roles); 