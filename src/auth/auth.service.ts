import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../database/repositories/users.repository';
import { UserEntity } from '../database/entities/user.entity';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { PasswordService } from './password.service';
import { JwtPayload } from './strategies/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existingByMobile = await this.usersRepository.findByMobile(dto.mobile);
    if (existingByMobile) {
      throw new ConflictException('A user with this mobile number already exists');
    }

    const existingByEmail = await this.usersRepository.findByEmail(dto.email);
    if (existingByEmail) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await this.passwordService.hash(dto.password);
    const user = await this.usersRepository.create({
      name: dto.name,
      mobile: dto.mobile,
      email: dto.email,
      address: dto.address,
      password: passwordHash,
      status: 'ACTIVE',
      role_id: dto.roleId ?? 'USER',
      firebase_uid: dto.firebaseUid,
      is_profile_completed: Boolean(dto.isProfileCompleted),
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersRepository.findByMobile(dto.mobile);
    if (!user?.password) {
      throw new UnauthorizedException('Invalid mobile number or password');
    }

    const isPasswordValid = await this.passwordService.verify(
      dto.password,
      user.password,
    );
    if (!isPasswordValid || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid mobile number or password');
    }

    return this.buildAuthResponse(user);
  }

  async getProfile(userId: number): Promise<UserProfileDto> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toProfile(user);
  }

  private async buildAuthResponse(user: UserEntity): Promise<AuthResponseDto> {
    const profile = this.toProfile(user);
    const payload: JwtPayload = {
      sub: user.user_id,
      mobile: user.mobile,
      email: user.email,
      role: user.role_id ?? 'USER',
    };
    const accessToken = await this.jwtService.signAsync(payload);

    await this.usersRepository.update(user.user_id, { token: accessToken });

    return {
      accessToken,
      tokenType: 'Bearer',
      user: profile,
    };
  }

  private toProfile(user: UserEntity): UserProfileDto {
    return {
      userId: user.user_id,
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      address: user.address ?? undefined,
      status: user.status,
      roleId: user.role_id ?? undefined,
      firebaseUid: user.firebase_uid ?? undefined,
      isProfileCompleted: user.is_profile_completed,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }
}
