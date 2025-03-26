import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, OneToMany, UpdateDateColumn, BaseEntity, JoinColumn } from "typeorm";
import { UserEntity } from "./User.entity";
import { HighlightStoryEntity } from "./HighlightStory.entity";

@Entity('highlights')
export class HighlightEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId : number;

    @ManyToOne(() => UserEntity, (user) => user.highlights, { onDelete: "CASCADE" })
    @JoinColumn({name : "userId"})
    user: UserEntity;

    @Column()
    name: string; 

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt : Date;

    @OneToMany(() => HighlightStoryEntity, (highlightStory) => highlightStory.highlight)
    highlightStories: HighlightStoryEntity[];
}
