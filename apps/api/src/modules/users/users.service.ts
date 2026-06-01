import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { ChangeMyPasswordDto } from './dto/change-my-password.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import * as bcrypt from 'bcrypt';

const USER_SELECT = {
  id: true,
  email: true,
  fullName: true,
  documentNumber: true,
  isActive: true,
  roleId: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async findAll(query: QueryUsersDto) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { documentNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.role) {
      const roleRecord = await this.prisma.role.findUnique({
        where: { name: query.role },
        select: { id: true },
      });
      if (roleRecord) {
        where.roleId = roleRecord.id;
      }
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          ...USER_SELECT,
          role: { select: { id: true, name: true } },
          studentProfile: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...USER_SELECT,
        role: { select: { id: true, name: true } },
        studentProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getRoles() {
    return this.prisma.role.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  async getUsersStats() {
    const [byRole, byStatus] = await Promise.all([
      this.prisma.user.groupBy({
        by: ['roleId'],
        _count: { roleId: true },
      }),
      this.prisma.user.groupBy({
        by: ['isActive'],
        _count: { isActive: true },
      }),
    ]);

    const total = await this.prisma.user.count();

    const active =
      byStatus.find((s) => s.isActive === true)?._count.isActive ?? 0;
    const inactive =
      byStatus.find((s) => s.isActive === false)?._count.isActive ?? 0;

    const roleMap: Record<string, number> = {};
    for (const r of byRole) {
      roleMap[r.roleId] = r._count.roleId;
    }

    const studentRole = await this.prisma.role.findUnique({
      where: { name: 'STUDENT' },
      select: { id: true },
    });

    const students = studentRole ? roleMap[studentRole.id] ?? 0 : 0;

    return { total, active, inactive, students };
  }

  async create(dto: CreateUserDto) {
    const role = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.name === 'STUDENT') {
      if (!dto.program || !dto.semester || !dto.studentCode) {
        throw new BadRequestException(
          'Program, semester, and student code are required for students',
        );
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          fullName: dto.fullName,
          documentNumber: dto.documentNumber,
          roleId: dto.roleId,
        },
        select: {
          ...USER_SELECT,
          role: { select: { id: true, name: true } },
        },
      });

      if (role.name === 'STUDENT') {
        await tx.studentProfile.create({
          data: {
            userId: created.id,
            program: dto.program!,
            semester: dto.semester!,
            studentCode: dto.studentCode!,
          },
        });
      }

      return {
        ...created,
        studentProfile:
          role.name === 'STUDENT'
            ? await tx.studentProfile.findUnique({ where: { userId: created.id } })
            : null,
      };
    });

    this.emitUserCreated(user);
    return user;
  }

  private emitUserCreated(user: { id: string; email: string; fullName: string; role: { name: string } }) {
    try {
      this.eventEmitter.emit('user.created', {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        roleName: user.role.name,
      });
    } catch {
      // best-effort: event emission failure must not break user creation
    }
  }

  async update(id: string, dto: UpdateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true, studentProfile: true },
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const effectiveRoleId = dto.roleId ?? existing.roleId;
    const role = dto.roleId
      ? await this.prisma.role.findUnique({ where: { id: dto.roleId } })
      : existing.role;

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.name === 'STUDENT') {
      const program = dto.program ?? existing.studentProfile?.program;
      const semester = dto.semester ?? existing.studentProfile?.semester;
      const studentCode = dto.studentCode ?? existing.studentProfile?.studentCode;

      if (!program || !semester || !studentCode) {
        throw new BadRequestException(
          'Program, semester, and student code are required for students',
        );
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: {
          email: dto.email,
          fullName: dto.fullName,
          documentNumber: dto.documentNumber,
          roleId: dto.roleId,
        },
        select: {
          ...USER_SELECT,
          role: { select: { id: true, name: true } },
        },
      });

      if (role.name === 'STUDENT') {
        await tx.studentProfile.upsert({
          where: { userId: id },
          update: {
            program: dto.program ?? existing.studentProfile?.program ?? '',
            semester: dto.semester ?? existing.studentProfile?.semester ?? 1,
            studentCode:
              dto.studentCode ?? existing.studentProfile?.studentCode ?? '',
          },
          create: {
            userId: id,
            program: dto.program!,
            semester: dto.semester!,
            studentCode: dto.studentCode!,
          },
        });
      }

      return {
        ...user,
        studentProfile:
          role.name === 'STUDENT'
            ? await tx.studentProfile.findUnique({ where: { userId: id } })
            : null,
      };
    });

    return updated;
  }

  async updateStatus(id: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        ...USER_SELECT,
        role: { select: { id: true, name: true } },
        studentProfile: true,
      },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.$transaction(async (tx) => {
      const counts = await Promise.all([
        tx.request.count({ where: { userId: id } }),
        tx.attachment.count({ where: { uploadedBy: id } }),
      ]);

      if (counts[0] > 0 || counts[1] > 0) {
        throw new ConflictException(
          'El usuario tiene registros asociados. Desactívelo en lugar de eliminarlo.',
        );
      }

      await tx.studentProfile.deleteMany({ where: { userId: id } });
      await tx.notification.deleteMany({ where: { userId: id } });
      await tx.refreshToken.deleteMany({ where: { userId: id } });
      await tx.user.delete({ where: { id } });
    });

    return { message: 'User deleted', id };
  }

  async getMyProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        documentNumber: true,
        role: { select: { name: true } },
        studentProfile: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateMyProfile(userId: string, dto: UpdateMyProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: dto.fullName,
        email: dto.email,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        documentNumber: true,
        role: { select: { name: true } },
        studentProfile: true,
        createdAt: true,
      },
    });
  }

  async changeMyPassword(userId: string, dto: ChangeMyPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const newHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    await this.prisma.refreshToken.deleteMany({ where: { userId } });

    return { message: 'Contraseña actualizada correctamente' };
  }
}
