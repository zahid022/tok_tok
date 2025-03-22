import {
    BaseEntity,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { UserEntity } from "./User.entity";
import { PostCommentEntity } from "./PostComment.entity";

@Entity("comment_likes")
export class CommentLikeEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @ManyToOne(() => UserEntity, user => user.commentLikes, {onDelete : "CASCADE"})
    @JoinColumn({ name: "userId" })
    user: UserEntity;

    @Column()
    commentId: number;

    @ManyToOne(() => PostCommentEntity, comment => comment.likes, {onDelete : 'CASCADE'})
    @JoinColumn({ name: "commentId" })
    comment: PostCommentEntity;

    @CreateDateColumn()
    createdAt: Date;
}