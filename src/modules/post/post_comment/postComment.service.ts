import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { ClsService } from "nestjs-cls";
import { PostCommentEntity } from "src/database/entity/PostComment.entity";
import { UserService } from "src/modules/user/user.service";
import { DataSource, IsNull, Repository } from "typeorm";
import { PostService } from "../post.service";
import { CommentCreateDto } from "./dto/post-comment-create.dto";
import { UserEntity } from "src/database/entity/User.entity";
import { BanService } from "src/modules/ban/ban.service";
import { FollowService } from "src/modules/follow/follow.service";
import { PaginationDto } from "src/shared/dto/pagination.dto";
import { CommentSelect } from "src/shared/selects/comment.select";
import { CommentUpdateDto } from "./dto/post-comment-update.dto";
import { CommentLikeEntity } from "src/database/entity/CommentLike.entity";
import { NotificationService } from "src/modules/notification/notification.service";
import { NotificationEnum } from "src/shared/enums/Notification.enum";

@Injectable()
export class PostCommentService {
    private postCommentRepo: Repository<PostCommentEntity>
    private postCommentLikeRepo: Repository<CommentLikeEntity>

    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private cls: ClsService,
        private userService: UserService,
        private postService: PostService,
        private banService: BanService,
        private followService: FollowService,
        private notificationService: NotificationService
    ) {
        this.postCommentRepo = this.dataSource.getRepository(PostCommentEntity)
        this.postCommentLikeRepo = this.dataSource.getRepository(CommentLikeEntity)
    }

    async list(id: number, params: PaginationDto) {
        let myUser = this.cls.get<UserEntity>("user")

        let post = await this.postService.findPost(id)

        if (!post) throw new NotFoundException("Post is not found")

        if (myUser.id !== post.userId) {
            let user = await this.userService.findUser(post.userId)
            if (!user) throw new NotFoundException("User is not found")

            let isBan = await this.banService.checkBan(myUser.id, user.id)
            if (isBan) throw new ForbiddenException("You are banned from interacting with this user");

            if (user.isPrivate) {
                let access = await this.followService.checkFollow(myUser.id, user.id)
                if (!access) throw new ForbiddenException("You do not have permission to comment on this post");
            }
        }

        let page = (params.page || 1) - 1;
        let limit = params.limit;

        let list = await this.postCommentRepo.find({
            where: {
                postId: id,
                parentCommentId: IsNull()
            },
            relations: [
                'user',
                'user.profile',
                'user.profile.image',
                'replies',
                'replies.user',
                'replies.user.profile',
                'replies.user.profile.image',
            ],
            order: {
                createdAt: 'DESC',
            },
            skip: page * limit,
            take: limit,
            select: CommentSelect
        })

        return list
    }

    async create(id: number, params: CommentCreateDto) {
        let myUser = this.cls.get<UserEntity>("user")

        let post = await this.postService.findPost(id)

        if (!post) throw new NotFoundException("Post is not found")

        if (myUser.id !== post.userId) {
            let user = await this.userService.findUser(post.userId)
            if (!user) throw new NotFoundException("User is not found")

            let isBan = await this.banService.checkBan(myUser.id, user.id)
            if (isBan) throw new ForbiddenException("You are banned from interacting with this user");

            if (user.isPrivate) {
                let access = await this.followService.checkFollow(myUser.id, user.id)
                if (!access) throw new ForbiddenException("You do not have permission to comment on this post");
            }
        }

        if (params.parentCommentId) {
            let parentComment = await this.postCommentRepo.findOne({
                where: {
                    id: params.parentCommentId
                }
            })

            if (!parentComment) throw new NotFoundException("Comment is not found")
            if (parentComment.parentCommentId !== null) throw new BadRequestException("Something went wrong")
        }

        let comment = this.postCommentRepo.create({
            content: params.content,
            parentCommentId: params.parentCommentId,
            userId: myUser.id,
            postId: post.id
        })

        await comment.save()

        if (comment.parentCommentId) {
            await this.incrementField(comment.parentCommentId, 'replyCount', 1)
        }

        await this.postService.incrementField(post.id, 'commentCount', 1)

        await this.notificationService.createNotification({
            userId: post.userId,
            type: NotificationEnum.COMMENT,
            message: `${myUser.username} commented on your post`,
            postId: post.id,
            commentId: comment.id
        })

        return {
            message: "Comment is created successfully"
        }
    }

    async like(commentId: number) {
        let user = this.cls.get<UserEntity>("user")

        let comment = await this.postCommentRepo.findOne({
            where: {
                id: commentId
            }
        })

        if (!comment) throw new NotFoundException("Comment is not found")

        let like = await this.postCommentLikeRepo.findOne({
            where: {
                commentId: comment.id,
                userId: user.id
            }
        })

        let value = 1;
        let message = "";

        if (like) {
            await this.postCommentLikeRepo.delete({ id: like.id });
            value = -1;
            message = "Like removed";
        } else {
            like = this.postCommentLikeRepo.create({
                userId: user.id,
                commentId: comment.id
            });

            await like.save();
            message = "Like added";

            await this.notificationService.createNotification({
                userId: comment.userId,
                message: `${user.username} liked your comment`,
                type: NotificationEnum.LIKE,
                postId: comment.postId,
                commentId: comment.id
            })
        }

        await this.incrementField(commentId, 'likesCount', value);

        return {
            message: message
        };
    }

    async update(commentId: number, params: CommentUpdateDto) {
        let myUser = this.cls.get<UserEntity>("user")

        let comment = await this.postCommentRepo.findOne({
            where: {
                id: commentId
            }
        })

        if (!comment) throw new NotFoundException("Comment is not found")

        if (comment.userId !== myUser.id) {
            throw new ForbiddenException("You do not have permission to update this comment");
        }

        comment.content = params.content

        await comment.save()

        return {
            message: "Comment is updated successfully"
        }
    }

    async delete(postId: number, commentId: number) {
        let user = this.cls.get<UserEntity>("user")

        let post = await this.postService.findPost(postId)

        if (!post) throw new NotFoundException("Post is not found")

        let comment = await this.postCommentRepo.findOne({
            where: {
                id: commentId
            }
        })

        if (!comment) throw new NotFoundException("Comment is not found")

        if (user.id === post.userId || user.id === comment.userId) {
            await this.postCommentRepo.delete({ id: commentId })

            if (comment.parentCommentId) {
                await this.incrementField(comment.parentCommentId, 'replyCount', -1)
            }

            await this.postService.incrementField(post.id, 'commentCount', -1)

            return {
                message: "Comment is deleted successfully"
            }
        }else{
            throw new ForbiddenException("You do not have permission to delete this comment");
        }


    }

    async incrementField(id: number, field: "replyCount" | "likesCount", value: number) {
        await this.postCommentRepo.increment({ id }, field, value)
    }
}