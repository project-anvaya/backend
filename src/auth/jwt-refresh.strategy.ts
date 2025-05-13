import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { Request } from 'express'; // Import Request from express
import * as bcrypt from 'bcrypt';

export interface JwtRefreshPayload {
  userId: string;
  // Add any other fields you put in the refresh token payload (e.g., a version number)
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') { // Unique name 'jwt-refresh'
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const secret = configService.get<string>('JWT_REFRESH_SECRET');
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is not set.');
    }
    super({
      // Extract token from Authorization header as Bearer token for simplicity,
      // or from request body/cookie if preferred.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      passReqToCallback: true, // Pass request object to validate method
    });
  }

  async validate(req: Request, payload: JwtRefreshPayload): Promise<any> {
    const refreshToken = req.get('authorization')?.replace('Bearer', '').trim();
    if (!refreshToken) throw new UnauthorizedException('Refresh token missing');

    const user = await this.usersService.findById(payload.userId);
    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Access Denied: User or stored token missing');
    }

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken,
    );

    if (!isRefreshTokenMatching) {
      // Optionally, clear the stored refresh token on mismatch for security
      // await this.usersService.updateRefreshToken(user.id, null);
      throw new UnauthorizedException('Access Denied: Refresh token mismatch');
    }
    
    // Exclude sensitive fields from the object returned and attached to req.user
    const { password, hashedRefreshToken, ...result } = user;
    return result; // This user object (without password/hashedToken) will be available in req.user
  }
} 