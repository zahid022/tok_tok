import { Body, Controller, Post, UseGuards } from "@nestjs/common";
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

    @Post()
    create(
        @Body() body : CreateStoryDto
    ){
        return this.storyService.create(body)
    }
}