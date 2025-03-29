import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNumber, IsString, MinLength } from "class-validator";

export class CreateChatGroupDto {
    @Type()
    @IsString()
    @MinLength(1)
    @ApiProperty({default : ''})
    name : string;

    @Type()
    @IsArray()
    @IsNumber({}, {each : true})
    @ApiProperty({default : []})
    participants : number[]
}