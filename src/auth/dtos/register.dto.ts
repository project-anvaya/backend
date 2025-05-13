import { IsEmail, IsString, IsNotEmpty, MinLength, IsEnum, IsOptional, IsPhoneNumber } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsEnum(Role)
  @IsNotEmpty()
  role: Role; // 'organizer' or 'vendor' (admin created separately)

  @IsPhoneNumber(undefined) // Use undefined for region-agnostic validation
  @IsOptional()
  phone?: string;
} 