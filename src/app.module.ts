import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './shared/prisma/prisma.module';

import { AuthModule } from './core/auth/auth.module';
import { UsersModule } from './core/users/users.module';
import { AttendanceModule } from './core/attendance/attendance.module';
import { NotificationModule } from './core/notification/notification.module';
import { SecurityModule } from './core/security/security.module';
import { CompanyModule } from './modules/company/company.module';
import { ConstructionModule } from './modules/construction/construction.module';
import { SchoolModule } from './modules/school/school.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AttendanceModule,
    NotificationModule,
    SecurityModule,
    CompanyModule,
    ConstructionModule,
    SchoolModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
