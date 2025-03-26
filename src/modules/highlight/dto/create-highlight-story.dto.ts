import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsPositive } from "class-validator";

export class HighlightStoryDto {
    @Type()
    @IsNumber()
    @IsPositive()
    @ApiProperty({default : 1})
    storyId : number;
}