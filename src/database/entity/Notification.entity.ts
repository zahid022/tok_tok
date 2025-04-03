import { NotificationEnum } from "src/shared/enums/Notification.enum";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./User.entity";
import { PostEntity } from "./Post.entity";
import { StoryEntity } from "./Story.entity";
import { PostCommentEntity } from "./PostComment.entity";

@Entity("notifications")
export class NotificationEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id : number;

    @Column()
    userId : number;

    @ManyToOne(() => UserEntity, {onDelete : 'CASCADE'})
    @JoinColumn({name : "userId"})
    user : UserEntity;

    @Column()
    senderId : number;

    @ManyToOne(() => UserEntity, {onDelete : 'CASCADE'})
    @JoinColumn({name : "senderId"})
    sender : UserEntity;

    @Column({type : 'enum', enum : NotificationEnum})
    type : NotificationEnum

    @Column()
    message : string;

    @Column({nullable : true})
    postId : number;

    @ManyToOne(() => PostEntity, {onDelete : 'CASCADE'})
    @JoinColumn({name : 'postId'})
    post : PostEntity

    @Column({nullable : true})
    storyId : number;

    @ManyToOne(() => StoryEntity, {onDelete : 'CASCADE'})
    @JoinColumn({name : 'storyId'})
    story : StoryEntity

    @Column({nullable : true})
    commentId : number;

    @ManyToOne(() => PostCommentEntity, {onDelete : 'CASCADE'})
    @JoinColumn({name : 'commentId'})
    comment : PostCommentEntity

    @Column({default : false})
    read : boolean;

    @CreateDateColumn()
    createdAt : Date;
}