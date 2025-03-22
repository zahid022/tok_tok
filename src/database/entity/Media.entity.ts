import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PostEntity } from "./Post.entity";
import { MediaTypes } from "src/shared/enums/Media.enum";

@Entity("media")
export class MediaEntity extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id : string;

    @Column()
    url : string;

    @Column({nullable : true})
    postId : number;

    @Column({type : 'enum', enum : MediaTypes})
    type : MediaTypes

    @ManyToOne(() => PostEntity, (post) => post.media, {onDelete : "CASCADE"})
    post : PostEntity
}