import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./User.entity";
import { ImageEntity } from "./Image.entity";

@Entity('profile')
export class ProfileEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable : true})
    fullName: string;

    @Column({ nullable: true })
    birth: string;

    @Column({ nullable: true })
    occupation: string;

    @Column({ nullable: true })
    bio: string;

    @Column({default : 0})
    follower : number;

    @Column({default : 0})
    following : number;

    @Column({default : 0})
    postCount: number;

    @Column()
    userId: number;

    @OneToOne(() => UserEntity, (item) => item.profile, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId', referencedColumnName: 'id'})
    user: UserEntity

    @Column({nullable : true})
    imageId : string

    @OneToOne(() => ImageEntity)
    @JoinColumn({name : "imageId", referencedColumnName : 'id'})
    image : ImageEntity
}