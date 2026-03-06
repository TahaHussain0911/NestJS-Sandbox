import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createSlug } from 'src/common/utils/helper';
import { Auth, AuthDocument } from '../auth/schemas/auth.schema';
import {
  Organization,
  OrganizationDocument,
} from './schemas/organization.schema';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel(Organization.name)
    private readonly organizationModel: Model<OrganizationDocument>,
    @InjectModel(Auth.name)
    private readonly authModel: Model<AuthDocument>,
  ) {}

  async createOrganization(
    userId: string,
    name: string,
  ): Promise<{ organization: Organization; user: Auth }> {
    const slug = createSlug(name);
    const organization = await this.organizationModel.findOne({ slug });
    if (organization) {
      throw new BadRequestException(
        `Organization with this name already exists`,
      );
    }
    const createdOrg = await this.organizationModel.create({
      name,
      slug,
      owner: userId,
    });
    const updatedUser = await this.authModel.findByIdAndUpdate(
      userId,
      {
        organization: createdOrg._id,
      },
      {
        returnDocument: 'after',
      },
    );
    if (!updatedUser)
      throw new BadRequestException('Request failed updating user');
    return {
      user: updatedUser,
      organization: createdOrg,
    };
  }
}
