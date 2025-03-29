import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { BanEntity } from "src/database/entity/Ban.entity";
import { DataSource, In, Repository } from "typeorm";
import { UserService } from "../user/user.service";
import { ClsService } from "nestjs-cls";
import { UserEntity } from "src/database/entity/User.entity";
import { FollowService } from "../follow/follow.service";
import { BanUserSelect } from "src/shared/selects/ban.select";

@Injectable()
export class BanService {

    private banRepo: Repository<BanEntity>

    constructor(
        @InjectDataSource() private dataSource: DataSource,
        @Inject(forwardRef(() => UserService))
        private userService: UserService,
        private cls: ClsService,
        @Inject(forwardRef(() => FollowService))
        private followService: FollowService
    ) {
        this.banRepo = this.dataSource.getRepository(BanEntity)
    }

    async banRequest(id: number) {
        let myUser = this.cls.get<UserEntity>("user")

        if (myUser.id === id) {
            throw new BadRequestException("You cannot ban yourself")
        }

        let toUser = await this.userService.findUser(id)

        if (!toUser) throw new NotFoundException("User is not found")

        let checkBan = await this.banRepo.findOne({
            where: {
                fromId: myUser.id,
                toId: toUser.id
            }
        })

        if (checkBan) throw new BadRequestException("You have already banned this user")

        let ban = this.banRepo.create({
            toId: toUser.id,
            fromId: myUser.id
        })

        await ban.save()

        let checkMyFollower = await this.followService.checkFollow(toUser.id, myUser.id)

        if (checkMyFollower) {
            await this.followService.removeFollower({ from: toUser.id })
        }

        let checkMyFollowing = await this.followService.checkFollow(myUser.id, toUser.id)

        if (checkMyFollowing) {
            await this.followService.removeFollowing({ to: toUser.id })
        }

        return {
            message: "User has been successfully banned"
        }
    }

    async unBanRequest(id: number) {
        let myUser = this.cls.get<UserEntity>("user")

        if (myUser.id === id) {
            throw new BadRequestException("You cannot unban yourself")
        }

        let toUser = await this.userService.findUser(id)

        if (!toUser) throw new NotFoundException("User is not found")

        let checkBan = await this.banRepo.findOne({
            where: {
                fromId: myUser.id,
                toId: toUser.id
            }
        })

        if (!checkBan) throw new NotFoundException("Ban request is not found")

        await this.banRepo.delete({ id: checkBan.id })

        return {
            message: "User has been successfully unbanned"
        }
    }

    async banList(id: number) {
        let myUser = this.cls.get<UserEntity>("user")

        if (myUser.id !== id) {
            throw new ForbiddenException("Forbidden")
        }

        let bans = await this.banRepo.find({
            where: {
                fromId: myUser.id
            },
            relations: [
                'to',
                'to.profile',
                'to.profile.image'
            ],
            order: { createdAt: "DESC" },
            select: BanUserSelect
        })

        return bans
    }

    async checkBan(userOne: number, userTwo: number): Promise<boolean> {
        const exists = await this.banRepo.exists({
            where: [
                { fromId: userOne, toId: userTwo },
                { fromId: userTwo, toId: userOne }
            ]
        });

        return exists;
    }

    async getBannedUsers(userIds: number[]) {
        let myUser = this.cls.get<UserEntity>("user")

        const bannedUsers = await this.banRepo.find({
            where: [
                { fromId: myUser.id, toId: In(userIds) },
                { toId: myUser.id, fromId: In(userIds) }
            ],
            select: ["fromId", "toId"]
        });

        return bannedUsers.map(ban =>
            ban.fromId === myUser.id ? ban.toId : ban.fromId
        );
    }
}