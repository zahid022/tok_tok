import { Controller, Post } from "@nestjs/common";
import { MessageService } from "./message.service";

@Controller("chat/:id/message")
export class MessageController {
    constructor(
        private messageService : MessageService
    ){}

}