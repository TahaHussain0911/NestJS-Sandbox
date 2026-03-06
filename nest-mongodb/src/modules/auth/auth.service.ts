import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { Model } from 'mongoose';
import { RegisterUser } from './dto/register-user.dto';
import { SignInUser } from './dto/signin-user.dto';
import { Auth, AuthDocument } from './schemas/auth.schema';
import { Tokens } from './types/tokens.types';
import { UpdateUser } from './dto/update-user.dto';
import { MailService } from 'src/mail/mail.service';
import { ResetPassword } from './dto/reset-password.dto';
import moment from 'moment';
import { Role, WithoutOwnerRole } from './enums/roles.enum';
import {
  Invitation,
  InvitationDocument,
} from '../invitation/schemas/invitation.schema';
import { InvitationStatus } from '../invitation/enums/invitation.enum';
import { ChangeUserRole } from './dto/change-user-role.dto';
import { Team, TeamDocument } from '../team/schemas/team.schema';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name)
    private readonly authModel: Model<AuthDocument>,
    @InjectModel(Invitation.name)
    private readonly invitationModel: Model<InvitationDocument>,
    @InjectModel(Team.name)
    private readonly teamModel: Model<TeamDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailservice: MailService,
  ) {}

  async registerUser(payload: RegisterUser): Promise<{
    tokens: Tokens;
    user: Omit<Auth, 'password'> | null;
  }> {
    const { name, email, password } = payload;
    const userExists = await this.authModel.findOne({
      email,
    });
    if (userExists) {
      throw new BadRequestException('User already exists!');
    }
    const hashPassword = await this.hashField(password);

    const createdUser = new this.authModel({
      name,
      email,
      password: hashPassword,
    });
    const session = await this.authModel.db.startSession();
    session.startTransaction();
    try {
      const invitation = await this.invitationModel
        .findOne({ email })
        .session(session);
      if (invitation) {
        createdUser.organization = invitation.organization;
        invitation.status = InvitationStatus.ACCEPTED;
        invitation.user = createdUser._id;
        await createdUser.save({ session });
        await invitation.save({ session });
      } else {
        createdUser.role = [Role.OWNER];
        await createdUser.save({ session });
      }
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    const userId = createdUser._id.toString();
    const { accessToken, refreshToken } = await this.getTokens({
      userId,
      email,
    });
    await this.updateRefreshToken({ userId, refreshToken });
    await this.mailservice.sendWelcome({
      email,
      name,
    });
    const { password: userPassword, ...userWithoutPass } =
      createdUser.toObject();
    return {
      user: userWithoutPass,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async signInUser(
    payload: SignInUser,
  ): Promise<{ tokens: Tokens; user: Omit<Auth, 'password'> }> {
    const { email, password } = payload;

    const user = await this.authModel
      .findOne({ email })
      .select('+password')
      .lean();
    if (!user) throw new BadRequestException('Invalid credentials');
    const isPasswordCorrect = await argon2.verify(user.password, password);
    if (!isPasswordCorrect)
      throw new BadRequestException('Invalid credentials');
    const userId = user._id.toString();
    const { accessToken, refreshToken } = await this.getTokens({
      userId,
      email,
    });
    await this.updateRefreshToken({ userId, refreshToken });
    const { password: userPassword, ...userWithoutPass } = user;
    return {
      tokens: {
        accessToken,
        refreshToken,
      },
      user: userWithoutPass,
    };
  }

  async changeUserRole(
    payload: ChangeUserRole,
    orgId: string,
  ): Promise<{ user: Auth; message: string }> {
    const { userId, role } = payload;
    const userInOrg = await this.authModel.findOne({
      _id: userId,
      organization: orgId,
    });
    if (!userInOrg)
      throw new BadRequestException('User doesnot exists in your organization');
    // if owner role is being changed
    if (userInOrg.role.includes(Role.OWNER))
      throw new BadRequestException('Cannot change owner role');
    // if user role is same as role from payload
    if (userInOrg.role.includes(role)) {
      return {
        user: userInOrg,
        message: 'User role changed!',
      };
    }
    // if user previous role was admin and role being changed to member
    if (userInOrg.role.includes(Role.ADMIN) && role === Role.MEMBER) {
      const teamExists = await this.teamModel.findOne({
        leader: new Types.ObjectId(userId),
      });
      if (teamExists) {
        throw new BadRequestException(
          `User is already an admin of a team. Cannot change role`,
        );
      }
    }
    userInOrg.role = [role];
    await userInOrg.save();
    return {
      user: userInOrg,
      message: 'User role changed!',
    };
  }

  async hashField(value: string): Promise<string> {
    const hashedField = await argon2.hash(value);
    return hashedField;
  }

  async getTokens({
    userId,
    email,
  }: {
    userId: string;
    email: string;
  }): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          userId,
          email,
        },
        {
          secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
          expiresIn: '15d',
        },
      ),
      this.jwtService.signAsync(
        {
          userId,
          email,
        },
        {
          secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async updateRefreshToken({
    userId,
    refreshToken,
  }: {
    userId: string;
    refreshToken: string;
  }) {
    const hashedRefreshToken = await this.hashField(refreshToken);
    await this.authModel.findByIdAndUpdate(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.authModel.findById(userId).select('+refreshToken');
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied!');
    const isRefreshTokenCorrect = await argon2.verify(
      user.refreshToken,
      refreshToken,
    );
    console.log(refreshToken, user.refreshToken, 'user.refreshToken');
    if (!isRefreshTokenCorrect) throw new ForbiddenException('Access Denied!');
    // return "Hello"
    const tokens = await this.getTokens({ userId, email: user.email });
    await this.updateRefreshToken({
      userId,
      refreshToken: tokens.refreshToken,
    });
    const { refreshToken: prevRefreshToken, ...userWithoutRefreshToken } =
      user.toObject();
    return {
      tokens,
      user: userWithoutRefreshToken,
    };
  }

  async updateUser(
    userId: string,
    payload: UpdateUser,
  ): Promise<{ user: Auth }> {
    const user = await this.authModel.findByIdAndUpdate(userId, payload, {
      returnDocument: 'after',
    });
    if (!user) throw new BadRequestException('User not found');
    return { user };
  }

  async requestResetPassword(email: string): Promise<{ message: string }> {
    const user = await this.authModel.findOne({ email });
    if (!user) throw new BadRequestException(`User doesnot exists!`);
    if (
      user.resetPasswordExpiry &&
      moment().isBefore(user.resetPasswordExpiry)
    ) {
      throw new BadRequestException(
        `A reset link has already been sent. Please try again in ${moment(user.resetPasswordExpiry).diff(moment(), 'minutes')} mins`,
      );
    }

    const token = this.jwtService.sign(
      {
        email,
      },
      {
        secret: this.configService.get('RESET_PASSWORD_SECRET'),
        expiresIn: '15m',
      },
    );
    user.resetPasswordExpiry = moment().add(15, 'minutes').toDate();
    await user.save();
    await this.mailservice.forgotPassword({
      name: user.name,
      email,
      url: `http://localhost:3000?token=${token}`,
    });
    return {
      message: 'Reset password link sent to your email!.',
    };
  }

  async resetPassword(payload: ResetPassword): Promise<{ message: string }> {
    const { password, token } = payload;
    const email = await this.decodeConfirmationToken(token);
    const user = await this.authModel.findOne({ email }).select('+password');
    if (!user) throw new BadRequestException(`User doesnot exists!`);
    const hashPassword = await this.hashField(password);
    user.password = hashPassword;
    user.resetPasswordExpiry = undefined;
    await user.save();
    return {
      message: 'Password reset successfully',
    };
  }
  async decodeConfirmationToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('RESET_PASSWORD_SECRET'),
      });
      console.log(payload, 'payload');
      if (typeof payload === 'object' && 'email' in payload) {
        return payload.email;
      }
      throw new BadRequestException();
    } catch (error) {
      console.log('====================================');
      console.log(error, 'error');
      console.log('====================================');
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('Email confirmation token expired');
      }
      throw new BadRequestException('Bad confirmation token');
    }
  }
}
