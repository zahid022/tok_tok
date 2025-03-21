import { Module } from "@nestjs/common";
import { CloudinaryModule } from "src/libs/cloudinary/cloudinary.module";
import { UploadService } from "./upload.service";
import { UploadController } from "./upload.controller";

@Module({
    imports : [CloudinaryModule],
    controllers : [UploadController],
    providers : [UploadService]
})
export class UploadModule {}