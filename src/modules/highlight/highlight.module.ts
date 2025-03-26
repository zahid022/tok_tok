import { Module } from "@nestjs/common";
import { HighlightController } from "./highlight.controller";
import { HighlightService } from "./highlight.service";
import { StoryModule } from "../story/story.module";
import { BanModule } from "../ban/ban.module";
import { FollowModule } from "../follow/follow.module";

@Module({
    imports : [StoryModule, BanModule, FollowModule],
    controllers : [HighlightController],
    providers : [HighlightService],
    exports : [HighlightService]
})
export class HighlightModule {}