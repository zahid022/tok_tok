import { ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { ClsService } from "nestjs-cls";
import { PostActionEntity } from "src/database/entity/PostAction.entity";
import { DataSource, Repository } from "typeorm";
import { PostService } from "../post.service";
import { FollowService } from "src/modules/follow/follow.service";
import { UserEntity } from "src/database/entity/User.entity";
import { UserService } from "src/modules/user/user.service";
import { BanService } from "src/modules/ban/ban.service";
import { PostActionTypes } from "src/shared/enums/Post.enum";
import { NotificationService } from "src/modules/notification/notification.service";
import { NotificationEnum } from "src/shared/enums/Notification.enum";

@Injectable()
export class PostActionService {
    private actionRepo: Repository<PostActionEntity>

    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private cls: ClsService,
        @Inject(forwardRef(() => PostService))
        private postService: PostService,
        private followService: FollowService,
        private userService: UserService,
        private banService: BanService,
        private notificationService : NotificationService
    ) {
        this.actionRepo = this.dataSource.getRepository(PostActionEntity)
    }

    async likePost(id: number) {
        let myUser = this.cls.get<UserEntity>("user")

        let post = await this.postService.findPost(id)

        if (!post) throw new NotFoundException("Post is not found")

        if (post.userId !== myUser.id) {
            let user = await this.userService.findUser(post.userId)
            if (!user) throw new NotFoundException("User is not found")

            let isBan = await this.banService.checkBan(myUser.id, user.id)
            if (isBan) throw new ForbiddenException("You are banned from interacting with this user")

            if (user.isPrivate) {
                let access = await this.followService.checkFollow(myUser.id, user.id)
                if (!access) throw new ForbiddenException("You do not have permission to like this post")
            }
        }

        let isLike = true
        let like = await this.actionRepo.findOne({
            where: {
                userId: myUser.id,
                postId: post.id,
                action: PostActionTypes.LIKE
            }
        })

        if (like) {
            await this.actionRepo.delete({ id: like.id })

            await this.postService.incrementField(post.id, 'like', -1)
            isLike = false
        } else {
            like = this.actionRepo.create({
                postId: post.id,
                userId: myUser.id,
                action: PostActionTypes.LIKE
            })

            await this.actionRepo.save(like);
            await this.postService.incrementField(post.id, 'like', 1)

            if(post.userId !== myUser.id){
                await this.notificationService.createNotification({
                    userId : post.userId,
                    type : NotificationEnum.LIKE,
                    message : `${myUser.username} liked your post`,
                    postId : post.id
                })
            }
        }

        return {
            message: isLike ? "Post liked successfully" : "Like removed successfully"
        }

    }

    async sharedPost(id: number) {
        let myUser = this.cls.get<UserEntity>("user")

        let post = await this.postService.findPost(id)

        if (!post) throw new NotFoundException("Post is not found")

        if (myUser.id !== post.userId) {
            let user = await this.userService.findUser(post.userId)
            if (!user) throw new NotFoundException("User is not found")

            let isBan = await this.banService.checkBan(myUser.id, post.userId)
            if (isBan) throw new ForbiddenException("You are banned from sharing this post");

            if (user.isPrivate) {
                let access = await this.followService.checkFollow(myUser.id, user.id)
                if (!access) throw new ForbiddenException("You do not have permission to share this post");
            }
        }

        let share = this.actionRepo.create({
            postId: post.id,
            userId: myUser.id,
            action: PostActionTypes.SHARED
        })

        await share.save()

        await this.postService.incrementField(post.id, 'shared', 1)

        return {
            message : "Post shared successfully"
        }
    }

    async viewPost(id: number) {
        let myUser = this.cls.get<UserEntity>("user")

        let post = await this.postService.findPost(id)

        if (!post) throw new NotFoundException("Post is not found")

        let view = await this.actionRepo.findOne({
            where : {
                postId : post.id,
                userId : myUser.id,
                action : PostActionTypes.VIEW
            }
        })

        if(!view){
            view = this.actionRepo.create({
                postId : post.id,
                userId : myUser.id,
                action : PostActionTypes.VIEW
            })

            await view.save()

            await this.postService.incrementField(post.id, 'view', 1)
        }

        return true
    }
}