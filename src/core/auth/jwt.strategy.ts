import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, type StrategyOptions } from 'passport-jwt';
import { AuthService } from './auth.service';
import { JwtPayload } from './types';

type JwtFromRequest = (req: unknown) => string | null;
type JwtStrategyOptions = {
  jwtFromRequest: JwtFromRequest;
  ignoreExpiration: boolean;
  secretOrKey: string;
};

const extractJwt = ExtractJwt as unknown as {
  fromAuthHeaderAsBearerToken: () => JwtFromRequest;
};
const JwtStrategyBase = PassportStrategy(Strategy) as new (
  options: StrategyOptions,
) => Strategy;

@Injectable()
export class JwtStrategy extends JwtStrategyBase {
  constructor(private readonly authService: AuthService) {
    const jwtFromRequest: JwtFromRequest =
      extractJwt.fromAuthHeaderAsBearerToken();
    const options: JwtStrategyOptions = {
      jwtFromRequest,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'change_me',
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super(options as StrategyOptions);
  }

  async validate(payload: JwtPayload) {
    return this.authService.validateUser(payload);
  }
}
