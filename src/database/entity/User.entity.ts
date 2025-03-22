import { hash } from "bcrypt";
import { UserProvider } from "src/shared/enums/User.enum";
import { BaseEntity, BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ProfileEntity } from "./Profile.entity";
import { FollowEntity } from "./Follow.entity";
import { BanEntity } from "./Ban.entity";
import { PostEntity } from "./Post.entity";
import { PostActionEntity } from "./PostAction.entity";
import { PostCommentEntity } from "./PostComment.entity";
import { CommentLikeEntity } from "./CommentLike.entity";

@Entity('users')
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    phone: string;

    @Column()
    password: string;

    @Column({ default: false })
    isPrivate: boolean;

    @Column({ type: 'enum', enum: UserProvider, default: UserProvider.LOCAL })
    provider: UserProvider

    @Column({ nullable: true })
    providerId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @BeforeInsert()
    @BeforeUpdate()
    async beforeUpsert() {
        if (!this.password) return

        this.password = await hash(this.password, 10);
    }

    @OneToOne(() => ProfileEntity, (item) => item.user, { cascade: true })
    profile: ProfileEntity;

    @OneToMany(() => FollowEntity, (follow: FollowEntity) => follow.from)
    following: FollowEntity[]

    @OneToMany(() => FollowEntity, (follow: FollowEntity) => follow.to)
    follower: FollowEntity[]

    @OneToMany(() => BanEntity, ban => ban.from)
    bannedUsers: BanEntity[];

    @OneToMany(() => BanEntity, ban => ban.to)
    bannedBy: BanEntity[];

    @OneToMany(() => PostEntity, (post: PostEntity) => post.user)
    posts: PostEntity[]

    @OneToMany(() => PostActionEntity, (action: PostActionEntity) => action.user)
    postActions: PostActionEntity[]

    @OneToMany(() => PostCommentEntity, (comment) => comment.user)
    comments: PostCommentEntity[]

    @OneToMany(() => CommentLikeEntity, (like: CommentLikeEntity) => like.user)
    commentLikes: CommentLikeEntity[]

    @ManyToMany(() => PostEntity, post => post.taggedUsers)
    taggedInPosts: PostEntity[];
}