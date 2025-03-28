import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./User.entity";
import { ChatEntity } from "./Chat.entity";

@Entity("participants")
export class ParticipantEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    chatId: number;

    @Column()
    request: boolean;

    @Column()
    userId: number;

    @ManyToOne(() => ChatEntity, { onDelete: "CASCADE" })
    @JoinColumn({ name: "chatId" })
    chat: ChatEntity

    @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user: UserEntity

    @Column({ default: 0 })
    unreadCount: number;
}