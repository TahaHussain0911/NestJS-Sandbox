import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth, AuthSchema } from './schemas/auth.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { MailModule } from 'src/mail/mail.module';
import { InvitationModule } from '../invitation/invitation.module';
import { TeamModule } from '../team/team.module';

@Module({
  imports: [
    MailModule,
    forwardRef(() => TeamModule),
    forwardRef(() => InvitationModule),
    // PassportModule.register({ defaultStrategy: 'jwt' }),
    PassportModule,
    MongooseModule.forFeature([
      {
        name: Auth.name,
        schema: AuthSchema,
      },
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('ACCESS_TOKEN_SECRET'),
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
  exports: [JwtStrategy, PassportModule, MongooseModule],
  // exporting passport module becuase
  // AuthGuard() use JwtStrategy to validate jwt token and Passport module
  // is also required for running AuthGuard() so outside auth module the AuthGuard
  // can work properly
})
export class AuthModule {}
