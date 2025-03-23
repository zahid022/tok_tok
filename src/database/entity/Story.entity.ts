import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, BaseEntity, OneToOne, JoinColumn } from "typeorm";
import { UserEntity } from "./User.entity";
import { MediaEntity } from "./Media.entity";

@Entity("stories")
export class StoryEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId : number;

    @ManyToOne(() => UserEntity, (user) => user.stories, { onDelete: "CASCADE" })
    @JoinColumn({name : "userId"})
    user: UserEntity;

    @OneToOne(() => MediaEntity, (media) => media.story)
    media : MediaEntity;

    @Column({default : 0})
    likeCount : number;

    @CreateDateColumn({type : 'timestamptz'})
    createdAt: Date;

    @Column({default : true}) 
    isActive: boolean;
}
