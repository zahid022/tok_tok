import { Module } from "@nestjs/common";
import { MediaController } from "./media.controller";
import { MediaService } from "./media.service";
import { CloudinaryModule } from "src/libs/cloudinary/cloudinary.module";

@Module({
    imports : [CloudinaryModule],
    controllers : [MediaController],
    providers : [MediaService]
})
export class MediaModule {}