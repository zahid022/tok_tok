import { ConflictException, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { UserEntity } from "src/database/entity/User.entity";
import { DataSource, In, Like, Repository } from "typeorm";
import { UpdateUsernameDto } from "./dto/update-username.dto";
import { ClsService } from "nestjs-cls";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { UpdateEmailDto } from "./dto/update-email.dto";
import { MailerService } from "@nestjs-modules/mailer";
import { FollowService } from "../follow/follow.service";
import { SearchUserDto } from "./dto/search-user.dto";

@Injectable()
export class UserService {
    private userRepo: Repository<UserEntity>

    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private cls: ClsService,
        private mailService: MailerService,
        @Inject(forwardRef(() => FollowService))
        private followService: FollowService
    ) {
        this.userRepo = this.dataSource.getRepository(UserEntity)
    }

    async findUser(id: number) {
        let user = await this.userRepo.findOne({
            where: { id }
        })

        if (!user) throw new NotFoundException("User is not found")

        return user
    }

    findUsers(ids: number[]) {
        return this.userRepo.findBy({
            id: In(ids)
        });
    }

    async getPrivateUsers(ids: number[]) {
        const privateUsers = await this.userRepo.find({
            where: { id: In(ids), isPrivate: true },
            select: ["id"]
        });

        return privateUsers
    }

    async searchUser(params: SearchUserDto) {
        let page = (params.page || 1) - 1;
        let limit = params.limit;

        let users = await this.userRepo.find({
            where: {
                username: Like(`${params.name}%`)
            },
            skip: page * limit,
            take: limit
        });

        return users;
    }

    async suggetionsUsername(username: string) {

        username = username
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/^-+|-+$/g, '');

        let suggestions = Array.from({ length: 10 }).map((_) => `${username}${Math.floor(Math.random() * 1000)}`)

        let checkUsernames = await this.userRepo.find({
            where: {
                username: In(suggestions)
            },
            select: {
                id: true,
                username: true
            }
        })

        let existUsername = checkUsernames.map((user) => user.username)

        suggestions = suggestions.filter(item => !existUsername.includes(item))

        return suggestions.slice(0, 2)
    }

    async checkUsername(username: string) {
        let check = await this.userRepo.exists({ where: { username } })

        return check
    }

    async updateUsername(id: number, params: UpdateUsernameDto) {
        let myUser = this.cls.get<UserEntity>("user")

        let username = params.username.toLowerCase()

        if (myUser.id !== id) {
            throw new ForbiddenException("You do not have permission to update this username.")
        }

        let checkUsername = await this.checkUsername(username)

        if (checkUsername) {
            throw new ConflictException({
                message: "Username is already exists",
                suggetions: await this.suggetionsUsername(username)
            })
        }

        myUser.username = username

        await myUser.save()

        return {
            message: "Username is updated successfully"
        }
    }

    async updateStatus(id: number, params: UpdateStatusDto) {
        let myUser = this.cls.get<UserEntity>("user")

        if (myUser.id !== id) {
            throw new ForbiddenException("You do not have permission to update this status.")
        }

        myUser.isPrivate = params.isPrivate

        await myUser.save()

        await this.followService.acceptAllPendingRequests()

        return {
            message: "User status is updated successfully"
        }
    }

    async updateEmail(id: number, params: UpdateEmailDto) {
        let myUser = this.cls.get<UserEntity>("user")

        if (myUser.id !== id) {
            throw new ForbiddenException("You do not have permission to update this email.")
        }

        let checkEmail = await this.userRepo.exists({ where: { email: params.email } })

        if (checkEmail) {
            throw new ConflictException("Email is already exists")
        }

        myUser.email = params.email

        await myUser.save()

        await this.mailService.sendMail({
            to: params.email,
            subject: 'Update email',
            template: 'update-email',
            context: {
                username: myUser.username,
                newEmail: params.email
            }
        })

        return {
            message: "Email is updated successfully"
        }
    }

    updateProfessionalAccount(){
        let user = this.cls.get<UserEntity>("user")


    }

    async incrementReportCount(id: number) {
        let user = await this.findUser(id)

        if (!user) throw new NotFoundException("User is not found")

        await this.userRepo.increment({ id: user.id }, 'reportCount', 1)

        return true
    }
}