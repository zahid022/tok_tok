import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { PostService } from "./post.service";
import { AuthGuard } from "src/shared/guards/Auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { CreatePostDto } from "./dto/create-post.dto";
import { PaginationDto } from "src/shared/dto/pagination.dto";

@Controller('post')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class PostController {
    constructor(
        private postService : PostService
    ){}

    @Get('me')
    myPosts(
        @Query() query: PaginationDto
    ){
        return this.postService.myPosts(query)
    }

    @Post()
    createPost(
        @Body() body : CreatePostDto
    ){
        return this.postService.createPost(body)
    }

    @Delete(":id")
    deletePost(
        @Param("id") id : number
    ){
        return this.postService.deletePost(id)
    }
}