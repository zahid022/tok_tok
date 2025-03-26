import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./User.entity";
import { StoryEntity } from "./Story.entity";
import { StoryActionTypes } from "src/shared/enums/Story.enum";

@Entity("story_actions")
export class StoryActionEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id : number;

    @Column({type : 'enum', enum : StoryActionTypes})
    action : StoryActionTypes

    @Column()
    userId : number;

    @Column()
    storyId : number;

    @ManyToOne(() => UserEntity, (user) => user.storyActions, {onDelete : "CASCADE"})
    @JoinColumn({name : "userId"})
    user : UserEntity;

    @ManyToOne(() => StoryEntity, (story) => story.actions, {onDelete : "CASCADE"})
    @JoinColumn({name : "storyId"})
    story : StoryEntity;

    @CreateDateColumn()
    createdAt : Date;

    @UpdateDateColumn()
    updatedAt : Date;
}