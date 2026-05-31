import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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
  constructor(private prisma: PrismaService) {}

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

    return user;
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
      include: {
        _count: { select: { requests: true, uploadedAttachments: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user._count.requests > 0 || user._count.uploadedAttachments > 0) {
      throw new ConflictException(
        'El usuario tiene registros asociados. Desactívelo en lugar de eliminarlo.',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.studentProfile.deleteMany({ where: { userId: id } });
      await tx.notification.deleteMany({ where: { userId: id } });
      await tx.refreshToken.deleteMany({ where: { userId: id } });
      await tx.user.delete({ where: { id } });
    });

    return { message: 'User deleted', id };
  }
}
