import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { PostCommentService } from "./postComment.service";
import { AuthGuard } from "src/shared/guards/Auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { CommentCreateDto } from "./dto/post-comment-create.dto";
import { PaginationDto } from "src/shared/dto/pagination.dto";
import { CommentUpdateDto } from "./dto/post-comment-update.dto";

@Controller("post/:id/comment")
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class PostCommentController {
    constructor(
        private postCommentService: PostCommentService
    ) { }

    @Get()
    list(
        @Param("id") id : number,
        @Query() query : PaginationDto
    ){
        return this.postCommentService.list(id, query)
    }

    @Post()
    create(
        @Param("id") id: number,
        @Body() body: CommentCreateDto
    ) {
        return this.postCommentService.create(id, body)
    }

    @Post(":commentId/like")
    like(
        @Param("id") id : number,
        @Param("commentId") commentId : number
    ){
        return this.postCommentService.like(commentId)
    }

    @Patch(":commentId/edit")
    update(
        @Param("id") id : number,
        @Param("commentId") commentId : number,
        @Body() body : CommentUpdateDto
    ){
        return this.postCommentService.update(commentId, body)
    }

    @Delete(":commentId")
    delete(
        @Param("id") id : number,
        @Param("commentId") commentId : number 
    ){
        return this.postCommentService.delete(id, commentId)
    }
}