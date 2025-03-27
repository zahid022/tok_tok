import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsString, MinLength } from "class-validator";

export class CreateMessageDto {
    @Type()
    @IsString()
    @IsOptional()
    @MinLength(1)
    @ApiProperty({default : ''})
    content : string;

    @Type()
    @IsString()
    @IsOptional()
    @MinLength(1)
    @ApiProperty({default : ''})
    mediaId : string;
}