import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from "../services/auth.service";
import { Strategy } from "passport-local";


@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {

    private _usernameField: string;
    private _passwordField: string;

    constructor(private readonly authService: AuthService) {
        super(); 
        this._usernameField = 'username';
        this._passwordField = 'password';
    }

    async validate(username: string, password: string): Promise<any> {
        const validaUsuario = await this.authService.validateUser(username, password);
        if (!validaUsuario) {
            throw new UnauthorizedException("Usuário e/ou senha incorretos!");
        }
        return validaUsuario;
    }

}