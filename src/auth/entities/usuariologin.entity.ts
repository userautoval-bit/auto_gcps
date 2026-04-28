import { ApiProperty } from "@nestjs/swagger"

export class UsuarioLogin {

    @ApiProperty() 
    public username!: string;

    @ApiProperty() 
    public password!: string;

}