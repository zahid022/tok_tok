import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { PostEntity } from "./Post.entity";
import { MediaTypes } from "src/shared/enums/Media.enum";
import { StoryEntity } from "./Story.entity";

@Entity("media")
export class MediaEntity extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id : string;

    @Column()
    url : string;

    @Column({nullable : true})
    postId : number;

    @Column({nullable : true})
    storyId : number;

    @Column({type : 'enum', enum : MediaTypes})
    type : MediaTypes

    @ManyToOne(() => PostEntity, (post) => post.media, {onDelete : "CASCADE"})
    @JoinColumn({name : "postId"})
    post : PostEntity

    @OneToOne(() => StoryEntity, (story) => story.media, {onDelete : 'CASCADE'})
    @JoinColumn({name : "storyId"})
    story : StoryEntity
}