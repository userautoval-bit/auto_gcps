import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './model/user.entity';
import { UsuarioService } from './services/user.service';
import { UsuarioController } from './controller/user.controller';
import { AuthModule } from 'src/auth/auth.module';


 
@Module({
  imports: [TypeOrmModule.forFeature([Usuario]),forwardRef(() => AuthModule), ],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule {}
 