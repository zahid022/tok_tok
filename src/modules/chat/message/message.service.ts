import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { MessageEntity } from "src/database/entity/Message.entity";
import { DataSource, Not, Repository } from "typeorm";
import { CreateMessageDto } from "./dto/create-message.dto";
import { ChatService } from "../chat.service";
import { ParticipantEntity } from "src/database/entity/Participant.entity";
import { ClsService } from "nestjs-cls";
import { UserEntity } from "src/database/entity/User.entity";

@Injectable()
export class MessageService {
    private messageRepo: Repository<MessageEntity>
    private participantRepo: Repository<ParticipantEntity>

    constructor(
        @InjectDataSource() private dataSource: DataSource,
        @Inject(forwardRef(() => ChatService))
        private chatService: ChatService,
        private cls: ClsService
    ) {
        this.messageRepo = this.dataSource.getRepository(MessageEntity)
        this.participantRepo = this.dataSource.getRepository(ParticipantEntity)
    }

    async createMessage(chatId: number, params: CreateMessageDto) {
        let myUser = this.cls.get<UserEntity>("user")

        if (!params.content && !params.media) {
            throw new BadRequestException("Content or media is required")
        }

        let chat = await this.chatService.findChat(chatId)

        if (!chat) throw new NotFoundException("Chat is not found")

        let checkParticipant = chat.participants.some(
            (participant) => participant.userId === myUser.id,
        );

        if (!checkParticipant) throw new NotFoundException('Chat is not found');

        let message = this.messageRepo.create({
            content: params.content,
            chatId,
            media: { id: params.media },
            userId: myUser.id
        })

        await message.save()

        await this.participantRepo.increment({
            chatId: chat.id,
            userId: Not(myUser.id)
        },
            'unreadCount',
            1
        )

        return message

    }
}