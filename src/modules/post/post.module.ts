import { forwardRef, Module } from "@nestjs/common";
import { PostController } from "./post.controller";
import { PostService } from "./post.service";
import { ProfileModule } from "../user/profile/profile.module";
import { FollowModule } from "../follow/follow.module";
import { BanModule } from "../ban/ban.module";
import { PostActionModule } from "./post_action/post_action.module";
import { PostCommentModule } from "./post_comment/postComment.module";
import { NotificationModule } from "../notification/notification.module";

@Module({
    imports : [
        forwardRef(() => ProfileModule), 
        forwardRef(() => FollowModule), 
        forwardRef(() => BanModule), 
        forwardRef(() => PostActionModule),
        forwardRef(() => PostCommentModule),
        NotificationModule
    ],
    controllers : [PostController],
    providers : [PostService],
    exports : [PostService]
})
export class PostModule {}