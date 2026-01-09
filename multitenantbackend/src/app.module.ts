import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BusinessModule } from './business/business.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { StaffController } from './staff/staff.controller';
import { StaffModule } from './staff/staff.module';
import { MailController } from './mail/mail.controller';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    StaffModule,
    UsersModule,
    BusinessModule,
    MailModule,
  ],
  controllers: [AppController, StaffController, MailController],
  providers: [AppService],
})
export class AppModule {}
