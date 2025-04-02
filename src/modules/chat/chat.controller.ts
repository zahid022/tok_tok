import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { AuthGuard } from "src/shared/guards/Auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { CreateSingleChatDto } from "./dto/create-chat.dto";
import { PaginationDto } from "src/shared/dto/pagination.dto";
import { CreateChatGroupDto } from "./dto/create-chat-group.dto";
import { UpdateChatDto } from "./dto/update-chat.dto";

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

    @Get(":id")
    getItem(
        @Param("id") id : number
    ){
        return this.chatService.getItem(id)
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

    @Post("group")
    group(
        @Body() body : CreateChatGroupDto
    ){
        return this.chatService.createChatGroup(body)
    }

    @Post(":id/update")
    updateGroup(
        @Param("id") id : number,
        @Body() body : UpdateChatDto
    ){
        return this.chatService.updateGroup(id , body)
    }

    @Post(":id/leave")
    leaveGroup(
        @Param("id") id : number
    ){
        return this.chatService.leaveGroup(id)
    }
}