import { forwardRef, Module } from "@nestjs/common";
import { PostCommentController } from "./postComment.controller";
import { PostCommentService } from "./postComment.service";
import { PostModule } from "../post.module";
import { FollowModule } from "src/modules/follow/follow.module";
import { BanModule } from "src/modules/ban/ban.module";

@Module({
    imports : [
        forwardRef(() => PostModule),
        forwardRef(() => FollowModule),
        forwardRef(() => BanModule)
    ],
    controllers : [PostCommentController],
    providers : [PostCommentService]
})
export class PostCommentModule {}