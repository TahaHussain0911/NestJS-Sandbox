import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Invitation, InvitationDocument } from './schemas/invitation.schema';
import { Model, Types } from 'mongoose';
import { InvitationStatus } from './enums/invitation.enum';
import { MailService } from 'src/mail/mail.service';
import { Auth, AuthDocument } from '../auth/schemas/auth.schema';

@Injectable()
export class InvitationService {
  constructor(
    @InjectModel(Invitation.name)
    private readonly invitationModel: Model<InvitationDocument>,
    @InjectModel(Auth.name)
    private readonly authModel: Model<AuthDocument>,
    private readonly mailService: MailService,
  ) {}

  async createInvitation(
    email: string,
    userId: string,
    orgId: string,
  ): Promise<{ message: string }> {
    const user = await this.authModel.findOne({ email });
    if (user) throw new BadRequestException('User already exists!');
    const invitation = await this.invitationModel.findOne({ email });
    if (invitation) {
      throw new BadRequestException(
        'User is already invited to an organization',
      );

      //   if (invitation.status === InvitationStatus.ACCEPTED)
      //     throw new BadRequestException('Invitation was accepted');
      //   if (String(invitation.organization) === String(orgId))
      //     throw new BadRequestException(
      //       'You have already invited to the organization',
      //     );
      //   invitation.organization = new Types.ObjectId(orgId);
      //   await invitation.save();
      //   return {
      //     message: 'Invited to user',
      //   };
    } else {
      await this.invitationModel.create({
        email,
        organization: orgId,
        invitedBy: userId,
      });
      await this.mailService.inviteUser({
        email,
        invitationLink: `http://localhost:3000`,
      });
      return {
        message: 'User invited to the organization',
      };
    }
  }
}
