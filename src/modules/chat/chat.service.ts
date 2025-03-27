import { ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { ChatEntity } from "src/database/entity/Chat_single.entity";
import { DataSource, Repository } from "typeorm";
import { CreateSingleChatDto } from "./dto/create-chat.dto";
import { ClsService } from "nestjs-cls";
import { UserEntity } from "src/database/entity/User.entity";
import { UserService } from "../user/user.service";
import { BanService } from "../ban/ban.service";
import { FollowService } from "../follow/follow.service";
import { ParticipantEntity } from "src/database/entity/Participant.entity";
import { MessageService } from "./message/message.service";

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

    async findChat(id : number){
        let user = this.cls.get<UserEntity>("user")

        let chat = await this.chatRepo.exists({
            where : {
                participants : {
                    userId : user.id
                },
                id
            }
        })

        return chat
    }

    async createSingleChat(params: CreateSingleChatDto) {
        let myUser = this.cls.get<UserEntity>("user")

        let currentUser = myUser

        let request = false

        if (myUser.id !== params.userId) {

            currentUser = await this.userService.findUser(params.userId)

            if (!currentUser) throw new NotFoundException("User is not found")

            let isBan = await this.banService.checkBan(myUser.id, params.userId)

            if (isBan) throw new ForbiddenException("You are not allowed to interact with this user")

            if (currentUser.isPrivate) {
                let access = await this.followService.checkFollow(myUser.id, currentUser.id)

                if (!access) {
                    request = true
                }
            }
        }

        let myChats = await this.chatRepo.find({
            where: {
                participants: {
                    userId: myUser.id
                }
            },
            relations: ['participants']
        })

        let chat = myChats.find(item => {
            return item.participants.some(participant => {
                return participant.userId = currentUser.id
            })
        })

        if (!chat) {
            let participants: ParticipantEntity[] = [];

            participants.push(this.participantRepo.create({ userId: myUser.id }));
            participants.push(
                this.participantRepo.create({ userId: currentUser.id }),
            );

            chat = this.chatRepo.create({
                participants,
                request
            });

            await chat.save()
        }

        let message = await this.messageService.createMessage(chat.id, { content: params.content, mediaId: '' }, false);

        await this.chatRepo.update(chat.id, { lastMessageId: message.id });

        return {
            message: 'Chat is created',
        };
    }
}