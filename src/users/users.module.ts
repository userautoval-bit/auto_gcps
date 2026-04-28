import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './model/user.entity';
import { UsuarioService } from './services/user.service';
import { UsuarioController } from './controller/user.controller';


 
@Module({
  imports: [TypeOrmModule.forFeature([Usuario]), ],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule {}
 