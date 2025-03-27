import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { AuthGuard } from "src/shared/guards/Auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { CreateSingleChatDto } from "./dto/create-chat.dto";

@Controller("chat")
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ChatController {
    constructor(
        private chatService : ChatService
    ){}

    @Post()
    createSingleChat(
        @Body() body : CreateSingleChatDto
    ){
        return this.chatService.createSingleChat(body)
    }
}