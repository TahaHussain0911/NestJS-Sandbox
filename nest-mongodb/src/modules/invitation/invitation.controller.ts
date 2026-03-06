import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OrganizationGuard } from 'src/common/guards/organization.guard';
import { Roles } from '../auth/decorators/roles.decorators';
import { Role } from '../auth/enums/roles.enum';
import { CreateInvitation } from './dto/create-invitation.dto';
import { AuthUser } from '../auth/decorators/auth_user.decorator';
import { MailService } from 'src/mail/mail.service';

@Controller('invitation')
export class InvitationController {
  constructor(
    private readonly invitationService: InvitationService,
  ) {}

  @Post('')
  @UseGuards(AuthGuard('jwt'), RolesGuard, OrganizationGuard)
  @Roles(Role.OWNER)
  createInvitation(
    @Body() payload: CreateInvitation,
    @AuthUser('_id') userId: string,
    @AuthUser('organization') orgId: string,
  ) {
    return this.invitationService.createInvitation(
      payload.email,
      userId,
      orgId,
    );
  }
}
