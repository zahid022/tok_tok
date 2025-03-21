import { forwardRef, Global, Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { FollowModule } from "../follow/follow.module";
import { BanModule } from "../ban/ban.module";

@Global()
@Module({
    imports: [forwardRef(() => FollowModule), BanModule],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule { }