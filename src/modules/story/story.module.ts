import { Module } from "@nestjs/common";
import { StoryController } from "./story.controller";
import { StoryService } from "./story.service";
import { FollowModule } from "../follow/follow.module";
import { BanModule } from "../ban/ban.module";
import { NotificationModule } from "../notification/notification.module";

@Module({
    imports : [FollowModule, BanModule, NotificationModule],
    controllers : [StoryController],
    providers : [StoryService],
    exports : [StoryService]
})
export class StoryModule {}