import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { StoryService } from "./story.service";
import { AuthGuard } from "src/shared/guards/Auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { CreateStoryDto } from "./dto/create-story.dto";

@Controller("story")
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class StoryController {
    constructor(
        private storyService : StoryService
    ){}

    @Get("feed")
    myFollowerStoryList(){
        return this.storyService.myFollowerStoryList()
    }

    @Post()
    create(
        @Body() body : CreateStoryDto
    ){
        return this.storyService.create(body)
    }

    @Post(':id/like')
    likeStory(
        @Param("id") id : number
    ){
        return this.storyService.likeStory(id)
    }

    @Post(':id/view')
    viewStory(
        @Param("id") id : number
    ){
        return this.storyService.viewStory(id)
    }

    @Delete(":id")
    delete(
        @Param("id") id : number
    ){
        return this.storyService.deleteStory(id)
    }
}