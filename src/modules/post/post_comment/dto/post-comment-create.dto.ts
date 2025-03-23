import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, MinLength } from "class-validator";

export class CommentCreateDto {
    @Type()
    @IsString()
    @MinLength(1)
    @ApiProperty({default : ''})
    content : string;

    @Type()
    @IsInt()
    @IsOptional()
    @ApiProperty({default : 1})
    parentCommentId : number;
}