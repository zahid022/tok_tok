import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { ChatEntity } from "src/database/entity/Chat.entity";
import { DataSource, In, Repository } from "typeorm";
import { CreateSingleChatDto } from "./dto/create-chat.dto";
import { ClsService } from "nestjs-cls";
import { UserEntity } from "src/database/entity/User.entity";
import { UserService } from "../user/user.service";
import { ParticipantEntity } from "src/database/entity/Participant.entity";
import { BanService } from "../ban/ban.service";
import { FollowService } from "../follow/follow.service";
import { MessageService } from "./message/message.service";
import { PaginationDto } from "src/shared/dto/pagination.dto";
import { CreateChatGroupDto } from "./dto/create-chat-group.dto";
import { UpdateChatDto } from "./dto/update-chat.dto";

@Injectable()
export class ChatService {
    private chatRepo: Repository<ChatEntity>
    private participantRepo: Repository<ParticipantEntity>

    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private cls: ClsService,
        private userService: UserService,
        private banService: BanService,
        private followService: FollowService,
        @Inject(forwardRef(() => MessageService))
        private messageService: MessageService
    ) {
        this.chatRepo = this.dataSource.getRepository(ChatEntity)
        this.participantRepo = this.dataSource.getRepository(ParticipantEntity)
    }

    async findChat(chatId: number) {
        let chat = await this.chatRepo.findOne({
            where: {
                id: chatId
            },
            relations: ['participants']
        })

        if (!chat) throw new NotFoundException("Chat is not found")

        return chat
    }

    async chatList(params: PaginationDto) {
        let user = this.cls.get<UserEntity>("user")

        const page = params.page || 1
        const limit = params.limit || 10

        const list = await this.chatRepo
            .createQueryBuilder("chat")
            .leftJoin("chat.participants", "myParticipant")
            .leftJoinAndSelect("chat.participants", "participants")
            .leftJoinAndSelect("participants.user", "user")
            .leftJoinAndSelect("user.profile", "profile")
            .leftJoinAndSelect("profile.image", "image")
            .leftJoinAndSelect("chat.lastMessage", "lastMessage")
            .leftJoinAndSelect("lastMessage.user", "lastMessageUser")
            .leftJoinAndSelect("lastMessageUser.profile", "lastMessageProfile")
            .leftJoinAndSelect("lastMessageProfile.image", "lastMessageImage")
            .where("myParticipant.userId = :userId", { userId: user.id })
            .andWhere("myParticipant.request = :request", { request: false })
            .select([
                'chat.id',
                'chat.name',
                'chat.isGroup',
                'chat.createdAt',
                'chat.updatedAt',
                'chat.adminId',
                'participants.id',
                'participants.unreadCount',
                'participants.request',
                'user.id',
                'user.username',
                'profile.id',
                'image.id',
                'image.url',
                'lastMessage.id',
                'lastMessage.content',
                'lastMessage.createdAt',
                'lastMessageUser.id',
                'lastMessageUser.username',
                'lastMessageProfile.id',
                'lastMessageImage.id',
                'lastMessageImage.url',
            ])
            .orderBy("chat.updatedAt", "DESC")
            .skip((page - 1) * limit)
            .take(limit)
            .getMany()

        return list.map((chat) => ({
            ...chat,
            unreadCount: chat.participants.find(participant => participant.user.id === user.id)?.unreadCount || 0
        }))
    }

    async chatRequestList(params: PaginationDto) {
        let user = this.cls.get<UserEntity>("user")

        const page = params.page || 1
        const limit = params.limit || 10

        const list = await this.chatRepo
            .createQueryBuilder("chat")
            .leftJoin("chat.participants", "myParticipant")
            .leftJoinAndSelect("chat.participants", "participants")
            .leftJoinAndSelect("participants.user", "user")
            .leftJoinAndSelect("user.profile", "profile")
            .leftJoinAndSelect("profile.image", "image")
            .leftJoinAndSelect("chat.lastMessage", "lastMessage")
            .leftJoinAndSelect("lastMessage.user", "lastMessageUser")
            .leftJoinAndSelect("lastMessageUser.profile", "lastMessageProfile")
            .leftJoinAndSelect("lastMessageProfile.image", "lastMessageImage")
            .where("myParticipant.userId = :userId", { userId: user.id })
            .andWhere("myParticipant.request = :request", { request: true })
            .select([
                'chat.id',
                'chat.name',
                'chat.isGroup',
                'chat.createdAt',
                'chat.updatedAt',
                'chat.adminId',
                'participants.id',
                'participants.unreadCount',
                'participants.request',
                'user.id',
                'user.username',
                'profile.id',
                'image.id',
                'image.url',
                'lastMessage.id',
                'lastMessage.content',
                'lastMessage.createdAt',
                'lastMessageUser.id',
                'lastMessageUser.username',
                'lastMessageProfile.id',
                'lastMessageImage.id',
                'lastMessageImage.url',
            ])
            .orderBy("chat.updatedAt", "DESC")
            .skip((page - 1) * limit)
            .take(limit)
            .getMany()

        return list.map((chat) => ({
            ...chat,
            unreadCount: chat.participants.find(participant => participant.user.id === user.id)?.unreadCount || 0
        }))
    }

    async createSingleChat(params: CreateSingleChatDto) {
        let myUser = this.cls.get<UserEntity>("user")

        if (myUser.id === params.userId) throw new BadRequestException("User id is valid")

        let user = await this.userService.findUser(params.userId)

        if (!user) throw new NotFoundException("User is not found")

        let isBan = await this.banService.checkBan(myUser.id, user.id)

        if (isBan) throw new ForbiddenException("")

        let request = false

        if (user.isPrivate) {
            let access = await this.followService.checkFollow(myUser.id, user.id)
            if (!access) {
                request = true
            }
        }

        let myChats = await this.chatRepo
            .createQueryBuilder("c")
            .leftJoin("c.participants", "myParticipant")
            .leftJoinAndSelect("c.participants", "participants")
            .select(["c.id", "participants.id", "participants.userId"])
            .where("c.isGroup = FALSE")
            .andWhere("myParticipant.userId =:userId", { userId: myUser.id })
            .getMany()

        let chat = myChats.find(chat => {
            return chat.participants?.some(participant => {
                return participant.userId = user.id
            })
        })

        if (!chat) {
            let participants: ParticipantEntity[] = []

            participants.push(this.participantRepo.create({ userId: myUser.id, request }))
            participants.push(this.participantRepo.create({ userId: user.id, request }))

            chat = this.chatRepo.create({
                participants
            })

            await chat.save()
        }

        await this.messageService.createMessage(chat.id, { content: params.content, media: params.media })

        return {
            message: "Chat created is successfully"
        }
    }

    async updateChatLastMessage(chatId: number, messageId: number) {
        await this.chatRepo.update({ id: chatId }, { lastMessageId: messageId })
    }

    async getItem(id: number) {
        let user = this.cls.get<UserEntity>('user');

        const chat = await this.chatRepo
            .createQueryBuilder('chat')
            .leftJoin('chat.participants', 'myParticipant')
            .leftJoinAndSelect('chat.participants', 'participants')
            .leftJoinAndSelect('participants.user', 'user')
            .leftJoinAndSelect('user.profile', 'profile')
            .leftJoinAndSelect('profile.image', 'image')
            .leftJoinAndSelect('chat.lastMessage', 'lastMessage')
            .leftJoinAndSelect('lastMessage.user', 'lastMessageUser')
            .leftJoinAndSelect('lastMessageUser.profile', 'lastMessageProfile')
            .leftJoinAndSelect('lastMessageProfile.image', 'lastMessageImage')
            .where('myParticipant.userId = :userId', { userId: user.id })
            .andWhere(`chat.id =:id`, { id })
            .select([
                'chat.id',
                'chat.name',
                'chat.isGroup',
                'chat.createdAt',
                'chat.updatedAt',
                'chat.adminId',
                'participants.id',
                'participants.unreadCount',
                'user.id',
                'user.username',
                'profile.id',
                'image.id',
                'image.url',
                'lastMessage.id',
                'lastMessage.content',
                'lastMessage.createdAt',
                'lastMessageUser.id',
                'lastMessageUser.username',
                'lastMessageProfile.id',
                'lastMessageImage.id',
                'lastMessageImage.url',
            ])
            .orderBy('chat.updatedAt', 'DESC')
            .getOne();

        if (!chat) throw new NotFoundException('error');

        return {
            ...chat,
            unreadCount:
                chat.participants.find((participant) => participant.user.id === user.id)
                    ?.unreadCount || 0,
        };
    }

    async createChatGroup(params: CreateChatGroupDto) {
        let myUser = this.cls.get<UserEntity>("user")

        let participantIds = [...new Set(params.participants)]

        const users = await this.userService.findUsers(participantIds)

        if (users.length !== params.participants.length) {
            throw new NotFoundException("User not found");
        }

        const banList = await this.banService.getBannedUsers(users.map(u => u.id));

        const privateUsersWithoutAccess = await this.followService.getUsersWithoutAccess(users.map(u => u.id));

        const validParticipants = users.filter(
            user => !banList.includes(user.id) && !privateUsersWithoutAccess.includes(user.id)
        );

        if (validParticipants.length === 0) {
            throw new NotFoundException("No valid participants for chat");
        }

        const participants = validParticipants.map(user =>
            this.participantRepo.create({ userId: user.id, request: false })
        );

        participants.push(this.participantRepo.create({ userId: myUser.id, request: false }));

        const chat = this.chatRepo.create({
            name: params.name,
            adminId: myUser.id,
            participants,
            isGroup: true
        });

        await this.chatRepo.save(chat);

        return chat;
    }

    async leaveGroup(chatId: number) {
        let myUser = this.cls.get<UserEntity>("user")

        let chat = await this.chatRepo.findOne({
            where: {
                id: chatId,
                isGroup: true
            },
            relations: ["participants"]
        })

        if (!chat) throw new NotFoundException("Chat is not found")

        let checkParticipant = chat.participants.some(participant => participant.userId === myUser.id)

        if (!checkParticipant) throw new NotFoundException("Chat is not found")

        if (chat.adminId === myUser.id) {
            let participantIds = chat.participants.filter(participant => participant.userId !== myUser.id)

            if (participantIds.length > 1) {
                await this.chatRepo.update({ id: chat.id }, { adminId: participantIds[0].userId });
            } else {
                await this.chatRepo.delete({ id: chat.id });
                return {
                    message: "Group deleted as there were no participants left."
                };
            }
        }

        await this.participantRepo.delete({ userId: myUser.id, chatId: chat.id })

        return {
            message: "You have successfully left the group."
        }
    }

    async updateGroup(chatId: number, params: UpdateChatDto) {
        let myUser = this.cls.get<UserEntity>("user")

        let chat = await this.chatRepo.findOne({
            where: {
                id: chatId,
                isGroup: true
            },
            relations: ['participants']
        })

        if (!chat) throw new NotFoundException("Chat is not found")

        if (chat.adminId !== myUser.id) {
            throw new ForbiddenException("You're not allowed to update this chat")
        }

        if (params.name) {
            chat.name = params.name
        }

        if (params.participants) {
            let participantIds = [...new Set(params.participants)];

            let users = await this.userService.findUsers(participantIds);

            if (users.length != participantIds.length) {
                throw new NotFoundException('Some of participants are not found');
            }

            let participants = participantIds.map((userId) => {
                let check = chat.participants.find(
                    (participant) => participant.userId === userId,
                );

                return check || this.participantRepo.create({ userId });
            });

            let deleteParticipant = chat.participants.filter(
                (participant) => !participantIds.includes(participant.id),
            );
            let deleteParticipantIds = deleteParticipant.map(
                (participant) => participant.id,
            );
            await this.participantRepo.delete({ id: In(deleteParticipantIds) });

            chat.participants = participants;

        }
        
        await chat.save();

        return {
            message: 'Chat is updated successfully',
            chat,
        };
    }
}