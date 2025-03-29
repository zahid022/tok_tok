import { forwardRef, Module } from "@nestjs/common";
import { MessageController } from "./message.controller";
import { MessageService } from "./message.service";
import { ChatModule } from "../chat.module";
import { MessageMediaModule } from "./message_media/message_media.module";

@Module({
    imports : [forwardRef(() => ChatModule), MessageMediaModule],
    controllers : [MessageController],
    providers : [MessageService],
    exports : [MessageService]
})
export class MessageModule {}