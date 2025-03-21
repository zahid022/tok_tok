import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./User.entity";

@Entity("bans")
export class BanEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fromId: number;

    @Column()
    toId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => UserEntity, (user: UserEntity) => user.bannedUsers, { onDelete: "CASCADE" })
    from: UserEntity;

    @ManyToOne(() => UserEntity, (user: UserEntity) => user.bannedBy, { onDelete: "CASCADE" })
    to: UserEntity
}