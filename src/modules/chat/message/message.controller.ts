import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { MessageService } from "./message.service";
import { CreateMessageDto } from "./dto/create-message.dto";
import { AuthGuard } from "src/shared/guards/Auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { PaginationDto } from "src/shared/dto/pagination.dto";

@Controller("chat/:chatId/message")
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class MessageController {
    constructor(
        private messageService : MessageService
    ){}

    @Get()
    chatMessages(
        @Param("chatId") chatId : number,
        @Query() query : PaginationDto
    ){
        return this.messageService.chatMessages(chatId, query)
    }

    @Post()
    createMessage(
        @Param("chatId") chatId : number,
        @Body() body : CreateMessageDto
    ){
        return this.messageService.createMessage(chatId, body)
    }

    @Post(':id/delete')
    deleteMessage(
        @Param("chatId") chatId : number,
        @Param("id") id : number
    ){
        return this.messageService.deleteMessage(chatId, id)
    }
}