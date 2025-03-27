import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./User.entity";
import { ChatEntity } from "./Chat_single.entity";
import { MessageMediaEntity } from "./MessageMedia.entity";

@Entity("messages")
export class MessageEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id : number; 

    @Column({nullable : true})
    content : string;

    @Column()
    userId : number;

    @Column()
    chatId : number;

    @ManyToOne(() => UserEntity)
    @JoinColumn({name : "userId"})
    user : UserEntity

    @ManyToOne(() => ChatEntity, {onDelete : "CASCADE"})
    @JoinColumn({name : "chatId"})
    chat : ChatEntity

    @OneToOne(() => MessageMediaEntity, (media) => media.message)
    media : MessageMediaEntity

    @CreateDateColumn()
    createdAt : Date;

    @UpdateDateColumn()
    updatedAt : Date;
}