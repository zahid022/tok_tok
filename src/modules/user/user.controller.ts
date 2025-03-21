import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "src/shared/guards/Auth.guard";
import { UpdateUsernameDto } from "./dto/update-username.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { UpdateEmailDto } from "./dto/update-email.dto";
import { FollowService } from "../follow/follow.service";
import { BanService } from "../ban/ban.service";

@Controller("user")
export class UserController {
    constructor(
        private userService: UserService,
        private followService : FollowService,
        private banService : BanService
    ) { }

    @Get(":id/followers")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    listFollower(
        @Param("id") id : number
    ){
        return this.followService.listFollower(id)
    }

    @Get(":id/followings")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    listFollowing(
        @Param("id") id : number
    ){
        return this.followService.listFollowing(id)
    }

    @Patch(':id/username')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    updateUsername(
        @Body() body: UpdateUsernameDto,
        @Param("id") id: number
    ) {
        return this.userService.updateUsername(id, body)
    }

    @Patch(":id/status")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    updateStatus(
        @Param("id") id : number,
        @Body() body : UpdateStatusDto
    ){
        return this.userService.updateStatus(id, body)
    }

    @Patch(":id/email")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    updateEmail(
        @Param("id") id : number,
        @Body() body : UpdateEmailDto
    ){
        return this.userService.updateEmail(id, body)
    }

    @Post(":id/ban")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    banRequest(
        @Param("id") id : number
    ){
        return this.banService.banRequest(id)
    }

    @Post(":id/unban")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    unBanRequest(
        @Param("id") id : number
    ){
        return this.banService.unBanRequest(id)
    }

    @Get(":id/ban")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    banList(
        @Param("id") id : number
    ){
        return this.banService.banList(id)
    }
}