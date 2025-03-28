import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import { MessageService } from "./message.service";
import { CreateMessageDto } from "./dto/create-message.dto";
import { AuthGuard } from "src/shared/guards/Auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";

@Controller("chat/:chatId/message")
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class MessageController {
    constructor(
        private messageService : MessageService
    ){}

    @Post()
    createMessage(
        @Param("chatId") chatId : number,
        @Body() body : CreateMessageDto
    ){
        return this.messageService.createMessage(chatId, body)
    }
}