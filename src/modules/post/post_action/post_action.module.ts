import { forwardRef, Module } from "@nestjs/common";
import { PostActionController } from "./post_action.controller";
import { PostActionService } from "./post_action.service";
import { PostModule } from "../post.module";
import { FollowModule } from "src/modules/follow/follow.module";
import { BanModule } from "src/modules/ban/ban.module";

@Module({
    imports : [forwardRef(() => PostModule), FollowModule, BanModule],
    controllers : [PostActionController],
    providers : [PostActionService],
    exports : [PostActionService]
})
export class PostActionModule {}