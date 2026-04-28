import { forwardRef, Module } from '@nestjs/common';
import { Bcrypt } from './bcrypt/bcrypt';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants/constants';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { UsuarioModule } from 'src/users/users.module';
import { AuthController } from './controllers/auth.controller';
import { LocalStrategy } from './strategy/local.strategy';


@Module({
    imports: [
        forwardRef(() =>UsuarioModule),
        JwtModule.register({
            secret:  jwtConstants.secret,
            signOptions: {expiresIn: '1h'}
        })
    ],
    controllers: [AuthController],
    providers: [Bcrypt, AuthService, LocalStrategy, JwtStrategy],
    exports: [Bcrypt],
})
export class AuthModule {};