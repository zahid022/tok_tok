import { FollowStatusEnum } from "src/shared/enums/Follow.enum";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./User.entity";

@Entity("follows")
export class FollowEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id : number;

    @Column({type : 'enum', enum : FollowStatusEnum})
    status : FollowStatusEnum

    @Column()
    fromId : number;

    @Column()
    toId : number;

    @ManyToOne(() => UserEntity, (user : UserEntity) => user.following, {onDelete : 'CASCADE'})
    from : UserEntity;

    @ManyToOne(() => UserEntity, (user : UserEntity) => user.follower, {onDelete : 'CASCADE'})
    to : UserEntity;

    @CreateDateColumn()
    createdAt : Date;

    @UpdateDateColumn()
    updatedAt : Date;
}