import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ParticipantEntity } from "./Participant.entity";
import { MessageEntity } from "./Message.entity";

@Entity("single_chats")
export class ChatEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id : number;

    @Column()
    request : boolean

    @Column({nullable : true})
    lastMessageId : number;

    @OneToMany(() => ParticipantEntity, (participant) => participant.chat, {cascade : true})
    participants : ParticipantEntity[]

    @OneToMany(() => MessageEntity, (message) => message.chat)
    messages : MessageEntity[]

    @OneToOne(() => MessageEntity)
    @JoinColumn({name : "lastMessageId"})
    lastMessage : MessageEntity

    @CreateDateColumn()
    createdAt : Date;

    @UpdateDateColumn()
    updatedAt : Date;
}