import { forwardRef, Module } from "@nestjs/common";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";
import { FollowModule } from "src/modules/follow/follow.module";
import { BanModule } from "src/modules/ban/ban.module";

@Module({
    imports : [forwardRef(() => FollowModule), BanModule],
    controllers : [ProfileController],
    providers : [ProfileService],
    exports : [ProfileService]
})
export class ProfileModule {}