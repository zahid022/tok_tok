import { forwardRef, Module } from "@nestjs/common";
import { BanService } from "./ban.service";
import { FollowModule } from "../follow/follow.module";

@Module({
    imports : [forwardRef(() => FollowModule)],
    controllers : [],
    providers : [BanService],
    exports : [BanService]
})
export class BanModule {}