import { forwardRef, Module } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Invitation, InvitationSchema } from './schemas/invitation.schema';
import { MailModule } from 'src/mail/mail.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    MailModule,
    MongooseModule.forFeature([
      {
        name: Invitation.name,
        schema: InvitationSchema,
      },
    ]),
  ],
  controllers: [InvitationController],
  providers: [InvitationService],
  exports: [MongooseModule],
})
export class InvitationModule {}
