import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class CreatePostDto {
    @Type()
    @IsString()
    @MinLength(1)
    @IsOptional()
    @ApiProperty({ default: "salam" })
    content: string;

    @Type()
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(10)
    @IsString({ each: true })
    media: string[];

    @Type()
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(10)
    @IsNumber({}, { each: true })
    @IsOptional()
    @ApiProperty({ default: [1, 2]})
    taggedUserIds: number[];
}