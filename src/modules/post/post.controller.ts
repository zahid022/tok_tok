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

    @Get("feed")
    feed(
        @Query() query : PaginationDto
    ){
        return this.postService.feed(query)
    }

    @Get("archive")
    listArchive(
        @Query() query: PaginationDto
    ){
        return this.postService.listArchive(query)
    }

    @Get(":id")
    item(
        @Param("id") id : number
    ){
        return this.postService.item(id)
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

    @Post(":id/archive")
    toggleArchive(
        @Param("id") id : number
    ){
        return this.postService.toggleArchive(id)
    }
}