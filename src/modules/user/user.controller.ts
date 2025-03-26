import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "src/shared/guards/Auth.guard";
import { UpdateUsernameDto } from "./dto/update-username.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { UpdateEmailDto } from "./dto/update-email.dto";
import { FollowService } from "../follow/follow.service";
import { BanService } from "../ban/ban.service";
import { PostService } from "../post/post.service";
import { PaginationDto } from "src/shared/dto/pagination.dto";
import { StoryService } from "../story/story.service";
import { HighlightService } from "../highlight/highlight.service";
import { SearchUserDto } from "./dto/search-user.dto";

@Controller("user")
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class UserController {
    constructor(
        private userService: UserService,
        private followService: FollowService,
        private banService: BanService,
        private postService: PostService,
        private storyService : StoryService,
        private higlightService : HighlightService
    ) { }

    @Get(":id/followers")
    listFollower(
        @Param("id") id: number
    ) {
        return this.followService.listFollower(id)
    }

    @Get("search")
    searchUser(
        @Query() query : SearchUserDto
    ){
        return this.userService.searchUser(query)
    }

    @Get(":id/followings")
    listFollowing(
        @Param("id") id: number
    ) {
        return this.followService.listFollowing(id)
    }

    @Patch(':id/username')
    updateUsername(
        @Body() body: UpdateUsernameDto,
        @Param("id") id: number
    ) {
        return this.userService.updateUsername(id, body)
    }

    @Patch(":id/status")
    updateStatus(
        @Param("id") id: number,
        @Body() body: UpdateStatusDto
    ) {
        return this.userService.updateStatus(id, body)
    }

    @Patch(":id/email")
    updateEmail(
        @Param("id") id: number,
        @Body() body: UpdateEmailDto
    ) {
        return this.userService.updateEmail(id, body)
    }

    @Post(":id/ban")
    banRequest(
        @Param("id") id: number
    ) {
        return this.banService.banRequest(id)
    }

    @Post(":id/unban")
    unBanRequest(
        @Param("id") id: number
    ) {
        return this.banService.unBanRequest(id)
    }

    @Get(":id/ban")
    banList(
        @Param("id") id: number
    ) {
        return this.banService.banList(id)
    }

    @Get(":id/posts")
    userPosts(
        @Param("id") id: number,
        @Query() query: PaginationDto
    ) {
        return this.postService.userPosts(id, query)
    }

    @Get(":id/story/all")
    myList(
        @Param("id") id : number,
        @Query() query : PaginationDto
    ){
        return this.storyService.myList(query)
    }

    @Get(":id/story/active/me")
    myStoryActiveList(
        @Param("id") id : number
    ){
        return this.storyService.myStoryActiveList()
    }

    @Get(":id/story")
    userStoryActiveList(
        @Param("id") id : number
    ){
        return this.storyService.userStoryActiveList(id)
    }

    @Get(":id/highlights")
    highlightList(
        @Param("id") id : number
    ){
        return this.higlightService.highlightList(id)
    }
}