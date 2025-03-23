import { Controller, Param, Post, UseGuards } from "@nestjs/common";
import { PostActionService } from "./post_action.service";
import { AuthGuard } from "src/shared/guards/Auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";

@Controller("post/:id/action")
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class PostActionController {
    constructor(
        private PostActionService : PostActionService
    ){}

    @Post("like")
    likePost(
        @Param("id") id : number
    ){
        return this.PostActionService.likePost(id)
    }

    @Post("share")
    sharePost(
        @Param("id") id : number
    ){
        return this.PostActionService.sharedPost(id)
    }
}