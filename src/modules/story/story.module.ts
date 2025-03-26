import { Module } from "@nestjs/common";
import { StoryController } from "./story.controller";
import { StoryService } from "./story.service";
import { FollowModule } from "../follow/follow.module";
import { BanModule } from "../ban/ban.module";

@Module({
    imports : [FollowModule, BanModule],
    controllers : [StoryController],
    providers : [StoryService],
    exports : [StoryService]
})
export class StoryModule {}