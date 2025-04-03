import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { MessageEntity } from "src/database/entity/Message.entity";
import { DataSource, Not, Repository } from "typeorm";
import { CreateMessageDto } from "./dto/create-message.dto";
import { ChatService } from "../chat.service";
import { ParticipantEntity } from "src/database/entity/Participant.entity";
import { ClsService } from "nestjs-cls";
import { UserEntity } from "src/database/entity/User.entity";
import { PaginationDto } from "src/shared/dto/pagination.dto";
import { MessageSelect } from "src/shared/selects/message.select";
import { SocketGateway } from "src/modules/socket/socket.gateway";

@Injectable()
export class MessageService {
    private messageRepo: Repository<MessageEntity>
    private participantRepo: Repository<ParticipantEntity>

    constructor(
        @InjectDataSource() private dataSource: DataSource,
        @Inject(forwardRef(() => ChatService))
        private chatService: ChatService,
        private cls: ClsService,
        private socketGateway: SocketGateway
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
        
        let rooms = this.socketGateway.server.to(chat.participants.map((participant) => `user_${participant.userId}`));
        rooms.emit('message-created', { id: message.id })

        await this.chatService.updateChatLastMessage(chatId, message.id)

        rooms.emit('chat-updated', { id: chat.id });

        return message

    }

    async chatMessages(chatId: number, params: PaginationDto) {
        let user = this.cls.get<UserEntity>("user")

        let chat = await this.chatService.findChat(chatId)

        if (!chat) throw new NotFoundException("Chat is not found")

        let checkParticipant = chat.participants.some((item) => item.userId === user.id)

        if (!checkParticipant) throw new NotFoundException("Chat is not found")

        let page = (params.page || 1) - 1;
        let limit = params.limit;

        await this.participantRepo.update({ userId: user.id, chatId: chat.id }, { unreadCount: 0 })

        let messages = await this.messageRepo.find({
            where: {
                chatId: chat.id
            },
            relations: ["user", "user.profile", "user.profile.image", "media"],
            select: MessageSelect,
            order: { createdAt: 'DESC' },
            take: limit,
            skip: page * limit
        })

        return messages
    }

    async deleteMessage(chatId: number, messageId: number) {
        let user = this.cls.get<UserEntity>("user")

        let message = await this.messageRepo.findOne({
            where: {
                chatId,
                userId: user.id,
                id: messageId
            }
        })

        if (!message) throw new NotFoundException("Message is not found")

        message.isDeleted = true

        await message.save()

        return {
            message: "Message is deleted successfully"
        }
    }
}