import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { HighlightService } from "./highlight.service";
import { AuthGuard } from "src/shared/guards/Auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { CretaeHighlightDto } from "./dto/create-highlight.dto";
import { HighlightStoryDto } from "./dto/create-highlight-story.dto";

@Controller("highlight")
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class HighlightController {
    constructor(
        private highlightService : HighlightService
    ){}

    @Get(":id")
    item(
        @Param("id") id : number
    ){
        return this.highlightService.item(id)
    }

    @Post(":id/add")
    add(
        @Param("id") id : number,
        @Body() body : HighlightStoryDto
    ){
        return this.highlightService.add(id, body)
    }

    @Post(":id/remove")
    remove(
        @Param("id") id : number,
        @Body() body : HighlightStoryDto
    ){
        return this.highlightService.remove(id, body)
    }

    @Post("new")
    createHighlight(
        @Body() body : CretaeHighlightDto
    ){
        return this.highlightService.createHighlight(body)
    }

    @Delete(":id")
    delete(
        @Param("id") id : number
    ){
        return this.highlightService.delete(id)
    }
}