import { forwardRef, Global, Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { FollowModule } from "../follow/follow.module";
import { BanModule } from "../ban/ban.module";
import { PostModule } from "../post/post.module";
import { StoryModule } from "../story/story.module";
import { HighlightModule } from "../highlight/highlight.module";

@Global()
@Module({
    imports: [forwardRef(() => FollowModule), BanModule, forwardRef(() => PostModule), StoryModule, HighlightModule],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule { }