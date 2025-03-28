import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsPositive, IsString, IsUUID, MinLength } from "class-validator";

export class CreateSingleChatDto {
    @Type()
    @IsString()
    @IsOptional()
    @MinLength(1)
    @ApiProperty({default : ''})
    content : string;

    @Type()
    @IsUUID()
    @IsOptional()
    @ApiProperty({default : ''})
    media : string;

    @Type()
    @IsInt()
    @IsPositive()
    @ApiProperty({default : 1})
    userId : number;
}