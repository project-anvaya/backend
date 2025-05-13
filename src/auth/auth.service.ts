import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { User, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService, // Inject Prisma for potential direct access if needed
  ) {}

  /**
   * Validates user credentials.
   * @param email User's email
   * @param pass User's password
   * @returns User object without password if valid, otherwise null
   */
  async validateUser(email: string, pass: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * Logs in a user and returns a JWT.
   * @param loginDto Login credentials
   * @returns Access token
   */
  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Registers a new user (vendor or organizer).
   * @param registerDto Registration details
   * @returns The newly created user object without password
   */
  async register(registerDto: RegisterDto): Promise<Omit<User, 'password'> | null> {
    // Prevent admin role registration through this endpoint
    if (registerDto.role === Role.admin) {
      throw new ConflictException('Admin registration is not allowed through this endpoint.');
    }
    
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    try {
      const user = await this.usersService.create({
        email: registerDto.email,
        password: registerDto.password,
        role: registerDto.role,
        phone: registerDto.phone,
        // Add default isActive: true if needed, Prisma schema default handles it
      });
      const { password, ...result } = user;
      return result;
    } catch (error) {
      // Handle potential database errors (e.g., Prisma constraints)
      console.error('Registration error:', error);
      throw new InternalServerErrorException('Could not register user.');
    }
  }

  // Potentially add methods for profile retrieval using JWT user context
  async getProfile(userId: string): Promise<Omit<User, 'password'> | null> {
     const user = await this.usersService.findById(userId);
     // findById already throws NotFoundException if user not found
     const { password, ...result } = user!;
     return result;
  }
}
