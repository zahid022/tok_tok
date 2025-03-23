import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { PostEntity } from "src/database/entity/Post.entity";
import { DataSource, Repository } from "typeorm";
import { UserService } from "../user/user.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { ClsService } from "nestjs-cls";
import { UserEntity } from "src/database/entity/User.entity";
import { ProfileService } from "../user/profile/profile.service";
import { FollowService } from "../follow/follow.service";
import { BanService } from "../ban/ban.service";
import { PaginationDto } from "src/shared/dto/pagination.dto";
import { PostsSelect } from "src/shared/selects/post.selects";
import { PostActionService } from "./post_action/post_action.service";

@Injectable()
export class PostService {

    private postRepo: Repository<PostEntity>

    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private userService: UserService,
        @Inject(forwardRef(() => ProfileService))
        private profileService: ProfileService,
        @Inject(forwardRef(() => FollowService))
        private followService: FollowService,
        @Inject(forwardRef(() => BanService))
        private banService: BanService,
        @Inject(forwardRef(() => PostActionService))
        private postActionService : PostActionService,
        private cls: ClsService
    ) {
        this.postRepo = this.dataSource.getRepository(PostEntity)
    }

    async createPost(params: CreatePostDto) {
        let myUser = this.cls.get<UserEntity>("user")

        let taggedUsers: undefined | UserEntity[] = undefined

        let post = this.postRepo.create({
            content: params.content,
            userId: myUser.id,
            media: params.media.map((id) => ({ id }))
        })

        if (params.taggedUserIds && params.taggedUserIds.length > 0) {

            params.taggedUserIds = params.taggedUserIds.filter(item => item !== myUser.id)

            taggedUsers = await this.userService.findUsers(params.taggedUserIds)

            if (params.taggedUserIds.length !== taggedUsers.length) {
                throw new NotFoundException("User is not found")
            }

            if (taggedUsers.length > 0) {
                const errorMessages: string[] = [];

                for (const user of taggedUsers) {
                    let isBan = await this.banService.checkBan(myUser.id, user.id);
                    if (isBan) {
                        errorMessages.push(`User ${user.username || user.id} has blocked you.`);
                        continue;
                    }

                    if (user.isPrivate) {
                        let access = await this.followService.checkFollow(myUser.id, user.id);
                        if (!access) {
                            errorMessages.push(`You don't have permission to view ${user.username || user.id}'s private profile.`);
                        }
                    }
                }

                if (errorMessages.length > 0) {
                    throw new ForbiddenException(errorMessages.join(''));
                }

                post.taggedUsers = taggedUsers
            }
        }

        await post.save()

        await this.profileService.incrementField(myUser.id, 'postCount', 1)

        return {
            message: "Post is created successfully"
        }
    }

    async findPost(id : number){
        let post = await this.postRepo.findOne({
            where : {
                id
            }
        })

        if(!post) throw new NotFoundException("Post is not found")

        return post
    }

    async item(id: number) {
        let myUser = this.cls.get<UserEntity>("user")

        let post = await this.postRepo.findOne({
            where: {
                id
            },
            relations: ['media', 'taggedUsers', 'user', 'user.profile', 'user.profile.image'],
            select: PostsSelect
        })

        if (!post) throw new NotFoundException("Post is not found")

        if (post.user.id !== myUser.id) {
            let isBan = await this.banService.checkBan(myUser.id, post.user.id)
            if (isBan) throw new ForbiddenException("You are banned from accessing this post.")

            let user = await this.userService.findUser(post.user.id)
            if (!user) throw new BadRequestException("Something went wrong")

            if (user.isPrivate) {
                let access = await this.followService.checkFollow(myUser.id, post.user.id)
                if (!access) throw new ForbiddenException("You do not have permission to access this post.")
            }
        }

        await this.postActionService.viewPost(post.id)

        return post
    }

    async myPosts(params: PaginationDto) {
        let user = this.cls.get<UserEntity>("user")

        let page = (params.page || 1) - 1;
        let limit = params.limit;

        let list = await this.postRepo.find({
            where: {
                userId: user.id,
                isActive: true
            },
            relations: ['media', 'taggedUsers', 'user', 'user.profile', 'user.profile.image'],
            select: PostsSelect,
            order: { createdAt: "DESC" },
            take: limit,
            skip: page * limit
        })

        return list
    }

    async userPosts(id: number, params: PaginationDto) {
        let myUser = this.cls.get<UserEntity>("user")

        if (myUser.id === id) {
            throw new BadRequestException("Invalid endpoint. You cannot view your own posts using this endpoint.")
        }

        let user = await this.userService.findUser(id)

        if (!user) throw new NotFoundException("User is not found")

        let isBan = await this.banService.checkBan(myUser.id, user.id)

        if (isBan) throw new ForbiddenException("You have been blocked by this user.")

        let access = true

        if (user.isPrivate) {
            access = await this.followService.checkFollow(myUser.id, user.id)
        }

        if (!access) throw new ForbiddenException("You do not have permission to view this user's posts. This account is private.")

        let page = (params.page || 1) - 1;
        let limit = params.limit;

        let list = await this.postRepo.find({
            where: {
                userId: user.id,
                isActive: true
            },
            relations: ['media', 'taggedUsers', 'user', 'user.profile', 'user.profile.image'],
            select: PostsSelect,
            order: { createdAt: "DESC" },
            take: limit,
            skip: page * limit
        })

        return list
    }

    async deletePost(id: number) {
        let user = this.cls.get<UserEntity>("user")

        let post = await this.postRepo.findOne({
            where: {
                id
            }
        })

        if (!post) throw new NotFoundException("Post is not found")

        if (post.userId !== user.id) {
            throw new ForbiddenException("You do not have permission to delete this post")
        }

        let { affected } = await this.postRepo.delete({ id: post.id })

        if (!affected) throw new BadRequestException("Failed to delete post")

        await this.profileService.incrementField(post.userId, 'postCount', -1)

        return {
            message: "Post is deleted successfully"
        }

    }

    async listArchive(params: PaginationDto) {
        let user = this.cls.get<UserEntity>("user")

        let page = (params.page || 1) - 1;
        let limit = params.limit;

        let list = await this.postRepo.find({
            where: {
                userId: user.id,
                isActive: false
            },
            relations: ['media', 'taggedUsers', 'user', 'user.profile', 'user.profile.image'],
            select: PostsSelect,
            order: { createdAt: "DESC" },
            take: limit,
            skip: page * limit
        })

        return list
    }

    async toggleArchive(id: number) {
        let user = this.cls.get<UserEntity>("user")

        let post = await this.postRepo.findOne({
            where: {
                id
            }
        })

        if (!post) throw new NotFoundException("Post is not found")

        if (user.id !== post.userId) {
            throw new ForbiddenException("You do not have permission to archive this post.");
        }

        post.isActive = !post.isActive

        await post.save()

        return {
            message: `Post has been ${post.isActive ? "unarchived" : "archived"}.`
        }
    }

    async incrementField(postId : number, field : 'like' | 'view' | 'commentCount' | 'shared' , value : number){
        await this.postRepo.increment({id : postId}, field, value)
    }
}