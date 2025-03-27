import { forwardRef, Module } from "@nestjs/common";
import { MessageController } from "./message.controller";
import { MessageService } from "./message.service";
import { ChatModule } from "../chat.module";

@Module({
    imports : [forwardRef(() => ChatModule)],
    controllers : [MessageController],
    providers : [MessageService],
    exports : [MessageService]
})
export class MessageModule {}