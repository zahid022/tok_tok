import { Module } from "@nestjs/common";
import { MessageMediaService } from "./message_media.service";
import { MessageMediaController } from "./message_media.controller";
import { CloudinaryModule } from "src/libs/cloudinary/cloudinary.module";

@Module({
    imports : [CloudinaryModule],
    controllers : [MessageMediaController],
    providers : [MessageMediaService],
    exports : [MessageMediaService]
})
export class MessageMediaModule {}