import { Entity, PrimaryGeneratedColumn, ManyToOne, BaseEntity, Column, JoinColumn } from "typeorm";
import { StoryEntity } from "./Story.entity";
import { HighlightEntity } from "./Highlight.entity";

@Entity("highlight_stories")
export class HighlightStoryEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    highlightId : number;

    @Column()
    storyId : number;

    @ManyToOne(() => HighlightEntity, (highlight) => highlight.highlightStories, { onDelete: "CASCADE" })
    @JoinColumn({name : "highlightId"})
    highlight: HighlightEntity;

    @ManyToOne(() => StoryEntity, { onDelete: "CASCADE" })
    @JoinColumn({name : "storyId"})
    story: StoryEntity;
}
