import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./User.entity";
import { MessageEntity } from "./Message.entity";
import { ParticipantEntity } from "./Participant.entity";

@Entity("chats")
export class ChatEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    name: string;

    @Column({ default: false })
    isGroup: boolean;

    @Column({ nullable: true })
    adminId: number;

    @Column({ nullable: true })
    lastMessageId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: "adminId" })
    admin: UserEntity;

    @OneToMany(() => MessageEntity, (message) => message.chat)
    messages: MessageEntity[]

    @OneToOne(() => MessageEntity)
    @JoinColumn({ name: "lastMessageId" })
    lastMessage: MessageEntity;

    @OneToMany(() => ParticipantEntity, (participant) => participant.chat, { cascade: true })
    participants: ParticipantEntity[]
}