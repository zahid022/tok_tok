import {
    BaseEntity,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany
} from "typeorm";
import { UserEntity } from "./User.entity";
import { PostEntity } from "./Post.entity";
import { CommentLikeEntity } from "./CommentLike.entity";

@Entity("post_comments")
export class PostCommentEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @Column()
    userId: number;

    @ManyToOne(() => UserEntity, user => user.comments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "userId" })
    user: UserEntity;

    @Column()
    postId: number;

    @ManyToOne(() => PostEntity, post => post.comments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "postId" })
    post: PostEntity;

    @Column({ nullable: true })
    parentCommentId: number;

    @ManyToOne(() => PostCommentEntity, comment => comment.replies)
    @JoinColumn({ name: "parentCommentId" })
    parentComment: PostCommentEntity;

    @OneToMany(() => PostCommentEntity, comment => comment.parentComment)
    replies: PostCommentEntity[];

    @OneToMany(() => CommentLikeEntity, like => like.comment)
    likes: CommentLikeEntity[];

    @Column({ default: 0 })
    replyCount: number;

    @Column({ default: 0 })
    likesCount: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}