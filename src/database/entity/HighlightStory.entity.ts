import { Entity, PrimaryGeneratedColumn, ManyToOne, BaseEntity } from "typeorm";
import { StoryEntity } from "./Story.entity";
import { HighlightEntity } from "./Highlight.entity";

@Entity("highlight_stories")
export class HighlightStoryEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => HighlightEntity, (highlight) => highlight.highlightStories, { onDelete: "CASCADE" })
    highlight: HighlightEntity;

    @ManyToOne(() => StoryEntity, { onDelete: "CASCADE" })
    story: StoryEntity;
}
