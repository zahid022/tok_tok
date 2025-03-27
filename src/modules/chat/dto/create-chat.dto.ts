import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsPositive, IsString, MinLength } from "class-validator";

export class CreateSingleChatDto {
    @Type()
    @IsPositive()
    @IsNumber()
    @ApiProperty({default : 1})
    userId : number;

    @Type()
    @IsString()
    @MinLength(1)
    @ApiProperty({default : ''})
    content : string;
}