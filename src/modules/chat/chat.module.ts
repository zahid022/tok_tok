import { forwardRef, Module } from "@nestjs/common";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { BanModule } from "../ban/ban.module";
import { FollowModule } from "../follow/follow.module";
import { MessageModule } from "./message/message.module";

@Module({
    imports : [BanModule, FollowModule, forwardRef(() => MessageModule)],
    controllers : [ChatController],
    providers : [ChatService],
    exports : [ChatService]
})
export class ChatModule {}