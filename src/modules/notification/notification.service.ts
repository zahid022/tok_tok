import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { DataSource, In, Repository } from "typeorm";
import { NotificationEntity } from "src/database/entity/Notification.entity";
import { InjectDataSource } from "@nestjs/typeorm";
import { ClsService } from "nestjs-cls";
import { UserEntity } from "src/database/entity/User.entity";
import { PaginationDto } from "src/shared/dto/pagination.dto";
import { NotificationSelect } from "src/shared/selects/notification.select";
import { UpdateNotificationDto } from "./dto/update-notification.dto";
import { SocketGateway } from "../socket/socket.gateway";

@Injectable()
export class NotificationService {

    private notificationRepo: Repository<NotificationEntity>

    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private cls: ClsService,
        private socketGateway: SocketGateway
    ) {
        this.notificationRepo = this.dataSource.getRepository(NotificationEntity)
    }

    async list(params: PaginationDto) {
        let user = this.cls.get<UserEntity>("user")

        let page = (params.page || 1) - 1;
        let limit = params.limit;

        let list = await this.notificationRepo.find({
            where: {
                userId: user.id
            },
            relations: [
                'sender',
                'sender.profile',
                'sender.profile.image',
                'post',
                'post.media',
                'comment',
                'story',
                'story.media'
            ],
            select: NotificationSelect,
            order: { createdAt: 'DESC' },
            take: limit,
            skip: page * limit
        })

        return list
    }

    async item(id : number){
        let user = this.cls.get<UserEntity>("user")

        let notification = await this.notificationRepo.findOne({
            where : {
                id,
                userId : user.id
            }
        })

        if(!notification) throw new NotFoundException("Notification is not found")

        return notification
    }

    async createNotification(params: CreateNotificationDto) {
        let senderUser = this.cls.get<UserEntity>("user")

        let notification = this.notificationRepo.create({
            userId: params.userId,
            senderId: senderUser.id,
            postId: params.postId,
            storyId: params.storyId,
            commentId: params.commentId,
            message: params.message,
            type: params.type
        })

        await notification.save()

        this.socketGateway.server
            .to(`user_${params.userId}`)
            .emit('notification', {id : notification.id})

        return {
            message: 'Notification created successfully'
        }
    }

    async updateNotifications(params: UpdateNotificationDto) {
        let user = this.cls.get<UserEntity>("user")

        const notifications = await this.notificationRepo.find({
            where: {
                id: In(params.ids),
                userId: user.id
            }
        });

        if (!notifications.length) {
            throw new NotFoundException("No notifications found for the provided IDs");
        }

        notifications.forEach(notification => {
            notification.read = true;
        });

        await this.notificationRepo.save(notifications);

        return {
            message: "Notifications updated successfully",
        };

    }
}