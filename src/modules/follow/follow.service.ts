import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { ClsService } from "nestjs-cls";
import { FollowEntity } from "src/database/entity/Follow.entity";
import { UserEntity } from "src/database/entity/User.entity";
import { DataSource, In, Repository } from "typeorm";
import { AcceptRequestDto, FollowRequestDto, RemoveFollowerDto, RemoveFollowingDto } from "./dto/follow-request.dto";
import { FollowStatusEnum } from "src/shared/enums/Follow.enum";
import { UserService } from "../user/user.service";
import { ProfileService } from "../user/profile/profile.service";
import { FollowersSelect, FollowingsSelect, PendingRequestsSelect } from "src/shared/selects/follow.select";
import { BanService } from "../ban/ban.service";
import { NotificationService } from "../notification/notification.service";
import { NotificationEnum } from "src/shared/enums/Notification.enum";

@Injectable()
export class FollowService {
    private followRepo: Repository<FollowEntity>

    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private cls: ClsService,
        @Inject(forwardRef(() => UserService))
        private userService: UserService,
        @Inject(forwardRef(() => ProfileService))
        private profileService: ProfileService,
        @Inject(forwardRef(() => BanService))
        private banService: BanService,
        private notificationService : NotificationService
    ) {
        this.followRepo = this.dataSource.getRepository(FollowEntity)
    }

    async checkStatus(fromId : number, toId : number){
        let follow = await this.followRepo.findOne({
            where : {
                fromId,
                toId
            }
        }) 

        if(!follow){
            return false
        }

        return follow.status
    }

    async listFollower(id: number) {
        let user = this.cls.get<UserEntity>("user")

        let access = true
        let currentUser = user

        if (user.id !== id) {

            currentUser = await this.userService.findUser(id)

            if (!currentUser) throw new NotFoundException("User is not found")

            if (currentUser.isPrivate) {
                access = await this.checkFollow(user.id, currentUser.id)
                if (!access) throw new ForbiddenException("You don't have permission to view this user's followers. This account is private and you need to be a follower to see this content.")
            }
        }

        let followers = await this.followRepo.find({
            where: {
                toId: currentUser.id,
                status: FollowStatusEnum.ACCEPT
            },
            relations: [
                'from',
                'from.profile',
                'from.profile.image'
            ],
            select: FollowersSelect
        })

        return followers
    }

    async listFollowing(id: number) {
        let user = this.cls.get<UserEntity>("user")

        let access = true
        let currentUser = user

        if (user.id !== id) {

            currentUser = await this.userService.findUser(id)

            if (!currentUser) throw new NotFoundException("User is not found")

            if (currentUser.isPrivate) {
                access = await this.checkFollow(user.id, currentUser.id)
                if (!access) throw new ForbiddenException("You don't have permission to view this user's followings. This account is private and you need to be a following to see this content.")
            }
        }

        let followings = await this.followRepo.find({
            where: {
                fromId: currentUser.id,
                status: FollowStatusEnum.ACCEPT
            },
            relations: [
                'to',
                'to.profile',
                'to.profile.image'
            ],
            select: FollowingsSelect
        })

        return followings
    }

    async followRequest(params: FollowRequestDto) {
        let user = this.cls.get<UserEntity>("user")

        if (params.to === user.id) {
            throw new BadRequestException("You cannot send a follow request to yourself.");
        }

        let isBan = await this.banService.checkBan(user.id, params.to)

        if (isBan) throw new ForbiddenException("You cannot follow this user. Either you have banned this user or they have banned you.")

        let checkFollow = await this.followRepo.findOne({
            where: {
                fromId: user.id,
                toId: params.to
            }
        })

        if (checkFollow) {
            if (checkFollow.status === FollowStatusEnum.PENDING) {
                throw new BadRequestException("You have already sent a follow request to this user.");
            } else if (checkFollow.status === FollowStatusEnum.ACCEPT) {
                throw new BadRequestException("You are already following this user.");
            }
        }

        let toUser = await this.userService.findUser(params.to)

        if (!toUser) throw new NotFoundException("User is not found")

        let notification = `${user.username} wants to follow you.`

        let follow = this.followRepo.create({
            fromId: user.id,
            toId: toUser.id,
            status: toUser.isPrivate ? FollowStatusEnum.PENDING : FollowStatusEnum.ACCEPT
        })

        await follow.save()

        if (follow.status === FollowStatusEnum.ACCEPT) {
            let promises: any[] = []

            promises.push(this.profileService.incrementField(user.id, 'following', 1))
            promises.push(this.profileService.incrementField(toUser.id, 'follower', 1))

            await Promise.all(promises);

            notification = `${user.username} has started following you.`
        }

        await this.notificationService.createNotification({
            message : notification,
            type : NotificationEnum.FOLLOW,
            userId : toUser.id,
            commentId : undefined,
            postId : undefined,
            storyId : undefined
        })

        return {
            message: "Follow has been sent successfully"
        }
    }

    async pendingRequests() {
        let user = this.cls.get<UserEntity>("user")

        let requests = await this.followRepo.find({
            where: {
                toId: user.id,
                status: FollowStatusEnum.PENDING
            },
            relations: [
                'from',
                'from.profile',
                'from.profile.image'
            ],
            select: PendingRequestsSelect
        })

        return requests
    }

    async checkFollow(from: number, to: number) {
        let follow = await this.followRepo.exists({
            where: {
                fromId: from,
                toId: to,
                status: FollowStatusEnum.ACCEPT
            }
        })

        return follow
    }

    async acceptRequest(params: AcceptRequestDto) {
        let user = this.cls.get<UserEntity>("user")

        if (params.from === user.id) {
            throw new BadRequestException("You cannot send a follow request to yourself.");
        }

        let follow = await this.followRepo.findOne({
            where: {
                fromId: params.from,
                toId: user.id,
                status: FollowStatusEnum.PENDING
            }
        })

        if (!follow) throw new NotFoundException("Follow request not found")

        follow.status = FollowStatusEnum.ACCEPT

        await follow.save()

        let promises: any[] = []

        promises.push(this.profileService.incrementField(user.id, 'follower', 1))
        promises.push(this.profileService.incrementField(params.from, 'following', 1))

        await Promise.all(promises)

        await this.notificationService.createNotification({
            userId : follow.fromId,
            message : `${user.username} has accepted your follow request.`,
            type : NotificationEnum.FOLLOW
        })

        return {
            message: "Follow request accepted successfully."
        };
    }

    async acceptAllPendingRequests() {
        let pendingRequests = await this.pendingRequests();

        await Promise.all(pendingRequests.map(async (follow) => {
            await this.acceptRequest({ from: follow.from.id });
        }));

        return true;
    }

    async removeFollower(params: RemoveFollowerDto) {
        let myUser = this.cls.get<UserEntity>("user")

        if (myUser.id === params.from) {
            throw new BadRequestException("You cannot remove yourself as a follower")
        }

        let user = await this.userService.findUser(params.from)

        if (!user) throw new NotFoundException("User is not found")

        let follow = await this.followRepo.findOne({
            where: {
                fromId: params.from,
                toId: myUser.id
            }
        })

        if (!follow) throw new NotFoundException("Follow request is not found")

        if (follow.status === FollowStatusEnum.ACCEPT) {
            let promises: any[] = []

            promises.push(this.profileService.incrementField(user.id, 'following', -1))
            promises.push(this.profileService.incrementField(myUser.id, 'follower', -1))

            await Promise.all(promises)
        }

        await this.followRepo.delete({ id: follow.id })

        return {
            message: "Follower has been successfully removed"
        }
    }

    async removeFollowing(params: RemoveFollowingDto) {
        let myUser = this.cls.get<UserEntity>("user")

        if (myUser.id === params.to) {
            throw new BadRequestException("You cannot remove yourself as a following")
        }

        let user = await this.userService.findUser(params.to)

        if (!user) throw new NotFoundException("User is not found")

        let follow = await this.followRepo.findOne({
            where: {
                fromId: myUser.id,
                toId: params.to
            }
        })

        if (!follow) throw new NotFoundException("Follow request is not found")

        if (follow.status === FollowStatusEnum.ACCEPT) {
            let promises: any[] = []

            promises.push(this.profileService.incrementField(myUser.id, 'following', -1))
            promises.push(this.profileService.incrementField(user.id, 'follower', -1))

            await Promise.all(promises)
        }

        await this.followRepo.delete({ id: follow.id })

        return {
            message: "Following has been successfully removed"
        }
    }

    async getUsersWithoutAccess(userIds: number[]) {
        let myUser = this.cls.get<UserEntity>("user")

        const privateUsers = await this.userService.getPrivateUsers(userIds)

        const followedUsers = await this.followRepo.find({
            where: {
                fromId: myUser.id,
                toId: In(userIds),
                status: FollowStatusEnum.ACCEPT
            },
            select: ["toId"]
        });

        const followedUserIds = followedUsers.map(f => f.toId);

        return privateUsers
            .map(user => user.id)
            .filter(id => !followedUserIds.includes(id));
    }
}