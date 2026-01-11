import {
  Injectable,
  UnauthorizedException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    // Create default admin user if none exists
    await this.ensureAdminExists();
  }

  private async ensureAdminExists() {
    const adminCount = await this.prisma.user.count();

    if (adminCount === 0) {
      const email = this.configService.get<string>('ADMIN_EMAIL');
      const password = this.configService.get<string>('ADMIN_PASSWORD');

      if (email && password) {
        const passwordHash = await bcrypt.hash(password, 10);
        await this.prisma.user.create({
          data: {
            email,
            passwordHash,
            name: 'Admin',
          },
        });
        this.logger.log(`Created default admin user: ${email}`);
      } else {
        this.logger.warn(
          'No admin user exists and ADMIN_EMAIL/ADMIN_PASSWORD not set',
        );
      }
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });
  }
}
