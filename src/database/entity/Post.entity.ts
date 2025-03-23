import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./User.entity";
import { MediaEntity } from "./Media.entity";
import { PostActionEntity } from "./PostAction.entity";
import { PostCommentEntity } from "./PostComment.entity";

@Entity('posts')
export class PostEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    content: string;

    @Column({default : true})
    isActive : boolean

    @Column()
    userId: number;

    @Column({ default: 0 })
    like: number;

    @Column({ default: 0 })
    view: number;

    @Column({ default: 0 })
    commentCount: number;

    @Column({default : 0})
    shared : number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => UserEntity, (user: UserEntity) => user.posts, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user: UserEntity;

    @OneToMany(() => MediaEntity, (media: MediaEntity) => media.post)
    media: MediaEntity[]

    @OneToMany(() => PostActionEntity, (action: PostActionEntity) => action.post)
    actions: PostActionEntity[]

    @OneToMany(() => PostCommentEntity, (comment: PostCommentEntity) => comment.post)
    comments: PostCommentEntity[]

    @ManyToMany(() => UserEntity)
    @JoinTable({
        name: "post_tagged_users",
        joinColumn: {
            name: "postId",
            referencedColumnName: "id"
        },
        inverseJoinColumn: {
            name: "userId",
            referencedColumnName: "id"
        }
    })
    taggedUsers: UserEntity[]
}