import { forwardRef, Module } from "@nestjs/common";
import { FollowController } from "./follow.controller";
import { FollowService } from "./follow.service";
import { ProfileModule } from "../user/profile/profile.module";
import { BanModule } from "../ban/ban.module";
import { NotificationModule } from "../notification/notification.module";

@Module({
    imports : [forwardRef(() => ProfileModule), forwardRef(() => BanModule), NotificationModule],
    controllers : [FollowController],
    providers : [FollowService],
    exports : [FollowService]
})
export class FollowModule {}