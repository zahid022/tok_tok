import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { AuthGuard } from "src/shared/guards/Auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { CreateSingleChatDto } from "./dto/create-chat.dto";
import { PaginationDto } from "src/shared/dto/pagination.dto";

@Controller("chat")
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ChatController {
    constructor(
        private chatService : ChatService
    ){}

    @Get()
    chatList(
        @Query() query : PaginationDto
    ){
        return this.chatService.chatList(query)
    }

    @Get("request")
    chatRequestList(
        @Query() query : PaginationDto
    ){
        return this.chatService.chatRequestList(query)
    }

    @Post()
    createSingleChat(
        @Body() body : CreateSingleChatDto
    ){
        return this.chatService.createSingleChat(body)
    }
}