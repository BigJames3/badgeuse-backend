import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RoleEnum } from '../../shared/enums/role.enum';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: RegisterDto) {
    const passwordHash = this.hashPassword(data.password);

    const roles = [RoleEnum.EMPLOYEE];

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
        companyId: data.companyId,
        roles,
      },
    });

    return this.issueTokens(user);
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (
      !user ||
      user.deletedAt ||
      !this.verifyPassword(data.password, user.passwordHash)
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user);
  }

  async validateUser(payload: JwtPayload) {
    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, deletedAt: null },
      select: {
        id: true,
        email: true,
        roles: true,
        companyId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }
    return user;
  }

  async refreshToken(token: string) {
    const refreshSecret = process.env.JWT_REFRESH_SECRET ?? 'change_me_refresh';
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, deletedAt: null },
      select: {
        id: true,
        email: true,
        roles: true,
        companyId: true,
        isActive: true,
        refreshTokenHash: true,
        refreshTokenExpiresAt: true,
      },
    });

    if (
      !user ||
      !user.isActive ||
      !user.refreshTokenHash ||
      !user.refreshTokenExpiresAt
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isExpired = user.refreshTokenExpiresAt.getTime() < Date.now();
    if (isExpired || !this.verifySecret(token, user.refreshTokenHash)) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.issueTokens(user);
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash: null,
        refreshTokenExpiresAt: null,
      },
    });
    return { success: true };
  }

  private async issueTokens(user: {
    id: string;
    email: string;
    roles: RoleEnum[];
    companyId: string;
    isActive?: boolean;
  }) {
    if (user.isActive === false) {
      throw new UnauthorizedException('User is inactive');
    }
    const accessTtlSeconds = Number(process.env.JWT_ACCESS_TTL ?? 900);
    const refreshTtlSeconds = Number(
      process.env.JWT_REFRESH_TTL ?? 60 * 60 * 24 * 7,
    );
    const refreshSecret = process.env.JWT_REFRESH_SECRET ?? 'change_me_refresh';

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      companyId: user.companyId,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: accessTtlSeconds,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: refreshTtlSeconds,
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshTokenHash: this.hashSecret(refreshToken),
        refreshTokenExpiresAt: new Date(Date.now() + refreshTtlSeconds * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      refreshExpiresIn: refreshTtlSeconds,
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
        companyId: user.companyId,
      },
    };
  }

  private hashPassword(password: string) {
    return this.hashSecret(password);
  }

  private verifyPassword(password: string, stored: string) {
    return this.verifySecret(password, stored);
  }

  private hashSecret(value: string) {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(value, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  private verifySecret(value: string, stored: string) {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    const hashed = scryptSync(value, salt, 64);
    const storedHash = Buffer.from(hash, 'hex');
    if (storedHash.length !== hashed.length) return false;
    return timingSafeEqual(storedHash, hashed);
  }
}
