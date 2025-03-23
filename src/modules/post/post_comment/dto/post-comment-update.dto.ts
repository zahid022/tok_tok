import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString, MinLength } from "class-validator";

export class CommentUpdateDto {
    @Type()
    @IsString()
    @MinLength(1)
    @ApiProperty({default : "test comment"})
    content : string;
}