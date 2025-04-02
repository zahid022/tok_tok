import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { ProfileEntity } from "src/database/entity/Profile.entity";
import { DataSource, Repository } from "typeorm";
import { UserService } from "../user.service";
import { ClsService } from "nestjs-cls";
import { UserEntity } from "src/database/entity/User.entity";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { MyProfileSelect, ProfileSelect } from "src/shared/selects/profile.select";
import { FollowService } from "src/modules/follow/follow.service";
import { BanService } from "src/modules/ban/ban.service";

@Injectable()
export class ProfileService {
    private profileRepo: Repository<ProfileEntity>

    constructor(
        @InjectDataSource() private dataSource: DataSource,
        @Inject(forwardRef(() => UserService))
        private userService: UserService,
        private cls: ClsService,
        @Inject(forwardRef(() => FollowService))
        private followService: FollowService,
        private banService: BanService
    ) {
        this.profileRepo = this.dataSource.getRepository(ProfileEntity)
    }

    async updateProfile(id: number, params: UpdateProfileDto) {
        let myUser = this.cls.get<UserEntity>("user")

        if (myUser.id !== id) {
            throw new ForbiddenException("You do not have permission to update this username.")
        }

        let { affected } = await this.profileRepo.update({ userId: id }, params)

        if (!affected) throw new BadRequestException("Something went wrong")

        return {
            message: "User is updated successfully"
        }
    }

    async getMyProfile() {
        let user = this.cls.get<UserEntity>("user")

        let profile = await this.profileRepo.findOne({
            where: {
                userId: user.id
            },
            relations: ['image', 'user'],
            select: MyProfileSelect
        })

        if (!profile) throw new NotFoundException("Profile is not found")

        return profile
    }

    async getProfile(id: number) {
        let user = this.cls.get<UserEntity>('user')

        if (id === user.id) {
            throw new BadRequestException("End point is wrong")
        }

        let profileUser = await this.userService.findUser(id)

        if (!profileUser) throw new NotFoundException("User is not found")

        let isBan = await this.banService.checkBan(user.id, profileUser.id)

        if (isBan) throw new ForbiddenException("You cannot view this profile. Either you have banned this user or they have banned you.")

        if (profileUser.isPrivate) {
            let access = await this.followService.checkFollow(user.id, profileUser.id)

            if (!access) {
                throw new ForbiddenException("You do not have access to view this private profile.");
            }
        }

        let profile = await this.profileRepo.findOne({
            where: {
                userId: profileUser.id
            },
            relations: ['image'],
            select: ProfileSelect
        })

        return profile
    }

    async incrementField(id: number, field: 'follower' | 'following' | 'postCount', value: number) {
        await this.profileRepo.increment({ userId: id }, field, value)
    }
}