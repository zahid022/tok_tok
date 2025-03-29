import { MessageMediaTypes } from "src/shared/enums/Media.enum";
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { MessageEntity } from "./Message.entity";

@Entity("message_media")
export class MessageMediaEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id : string;

    @Column()
    url : string;

    @Column({nullable : true})
    messageId : number;

    @Column({type : 'enum', enum : MessageMediaTypes})
    type : MessageMediaTypes

    @OneToOne(() => MessageEntity, (message) => message, {onDelete : "CASCADE"})
    @JoinColumn({name : "messageId"})
    message : MessageEntity
}