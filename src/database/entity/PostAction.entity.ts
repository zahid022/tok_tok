import { PostActionTypes } from "src/shared/enums/Post.enum";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./User.entity";
import { PostEntity } from "./Post.entity";

@Entity("post_actions")
export class PostActionEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id : number;

    @Column({type : 'enum', enum : PostActionTypes})
    action : PostActionTypes

    @Column()
    userId : number;

    @Column()
    postId : number;

    @ManyToOne(() => UserEntity, (user) => user.postActions, {onDelete : "CASCADE"})
    @JoinColumn({name : "userId"})
    user : UserEntity;

    @ManyToOne(() => PostEntity, (post : PostEntity) => post.actions, {onDelete : "CASCADE"})
    @JoinColumn({name : "postId"})
    post : PostEntity
}