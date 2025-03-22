import { forwardRef, Module } from "@nestjs/common";
import { PostController } from "./post.controller";
import { PostService } from "./post.service";
import { ProfileModule } from "../user/profile/profile.module";
import { FollowModule } from "../follow/follow.module";
import { BanModule } from "../ban/ban.module";

@Module({
    imports : [forwardRef(() => ProfileModule), forwardRef(() => FollowModule), forwardRef(() => BanModule)],
    controllers : [PostController],
    providers : [PostService],
    exports : [PostService]
})
export class PostModule {}