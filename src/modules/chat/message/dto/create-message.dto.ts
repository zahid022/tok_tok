import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsString, IsUUID, MinLength } from "class-validator";

export class CreateMessageDto {
    @Type()
    @IsString()
    @MinLength(1)
    @IsOptional()
    @ApiProperty({default : ''})
    content : string;

    @Type()
    @IsUUID()
    @IsOptional()
    @ApiProperty({default : ''})
    media : string;
}