import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganization } from './dtos/create-organization.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/enums/roles.enum';
import { Roles } from '../auth/decorators/roles.decorators';
import { AuthUser } from '../auth/decorators/auth_user.decorator';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post('')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.OWNER)
  createOrganization(
    @Body() payload: CreateOrganization,
    @AuthUser('_id') userId: string,
    @AuthUser('organization') organization: string,
  ) {
    if (organization) {
      throw new BadRequestException(
        'Organization for this user already exists!',
      );
    }
    return this.organizationService.createOrganization(userId, payload.name);
  }
}
