import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { MessageEntity } from "src/database/entity/Message.entity";
import { DataSource, Not, Repository } from "typeorm";
import { CreateMessageDto } from "./dto/create-message.dto";
import { ClsService } from "nestjs-cls";
import { UserEntity } from "src/database/entity/User.entity";
import { ParticipantEntity } from "src/database/entity/Participant.entity";
import { ChatService } from "../chat.service";

@Injectable()
export class MessageService {
    private messageRepo: Repository<MessageEntity>
    private participantRepo: Repository<ParticipantEntity>

    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private cls: ClsService,
        @Inject(forwardRef(() => ChatService))
        private chatService : ChatService
    ) {
        this.messageRepo = this.dataSource.getRepository(MessageEntity)
        this.participantRepo = this.dataSource.getRepository(ParticipantEntity)
    }

    async createMessage(chatId: number, params: CreateMessageDto, type = true) {
        if (params.mediaId && params.content) {
            throw new BadRequestException("Media id or content is required")
        }

        if(type){
            let chat = await this.chatService.findChat(chatId)
            if(!chat) throw new NotFoundException("Chat is not found")
        }

        let user = this.cls.get<UserEntity>("user")

        let message = this.messageRepo.create({
            chatId,
            content: params.content,
            media: { id: params.mediaId ? params.mediaId : undefined },
            userId: user.id
        })

        await message.save()

        await this.participantRepo.increment(
            { chatId, userId: Not(user.id) },
            'unreadCount',
            1,
        );

        return message
    }

}