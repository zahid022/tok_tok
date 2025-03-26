import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsPositive, IsString, MinLength } from "class-validator";

export class CretaeHighlightDto {
    @Type()
    @IsString()
    @MinLength(1)
    @ApiProperty({default : ""})
    name : string;

    @Type()
    @IsNumber()
    @IsPositive()
    @ApiProperty({default : 1})
    storyId : number;
}