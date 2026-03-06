import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { StudentModule } from './modules/student/student.module';
import { TaskModule } from './modules/task/task.module';
import { MailModule } from './mail/mail.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { InvitationModule } from './modules/invitation/invitation.module';
import { TeamModule } from './modules/team/team.module';
import { ProjectModule } from './modules/project/project.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DATABASE_URL!),
    StudentModule,
    AuthModule,
    TaskModule,
    MailModule,
    OrganizationModule,
    InvitationModule,
    TeamModule,
    ProjectModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
