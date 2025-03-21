import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { FollowService } from "./follow.service";
import { AuthGuard } from "src/shared/guards/Auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AcceptRequestDto, FollowRequestDto, RemoveFollowerDto, RemoveFollowingDto } from "./dto/follow-request.dto";

@Controller('follow')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class FollowController {
    constructor(
        private followService : FollowService
    ){}

    @Post('request')
    followRequest(
        @Body() body : FollowRequestDto
    ){
        return this.followService.followRequest(body)
    }

    @Post('accept_request')
    acceptRequest(
        @Body() body : AcceptRequestDto
    ){
        return this.followService.acceptRequest(body)
    }

    @Get("pending_requests")
    pendingRequests(){
        return this.followService.pendingRequests()
    }

    @Post("remove_follower")
    removeFollower(
        @Body() body : RemoveFollowerDto
    ){
        return this.followService.removeFollower(body)
    }

    @Post("remove_following")
    removeFollowing(
        @Body() body : RemoveFollowingDto
    ){
        return this.followService.removeFollowing(body)
    }
}