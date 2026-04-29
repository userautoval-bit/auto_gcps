import { Module } from "@nestjs/common";
import { GcpsService } from "./service/gcps.service";
import { TypeOrmModule } from "@nestjs/typeorm/dist/typeorm.module";
import { Gcps } from "./model/gcps.entity";
import { GcpsController } from "./controller/gcps.controllers";
import { AuthModule } from "src/auth/auth.module";

@Module({
    imports:[TypeOrmModule.forFeature([Gcps]),
    AuthModule,],
    controllers:[GcpsController],
    providers:[GcpsService],
    exports:[TypeOrmModule, GcpsService],  
 })
export class GcpsModule {}