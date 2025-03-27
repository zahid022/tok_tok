import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, IsString, Min, MinLength } from "class-validator";

export class CreateReportDto {
    @Type()
    @IsString()
    @MinLength(1)
    @IsOptional()
    @ApiProperty({default : ''})
    text : string;

    @Type()
    @IsNumber()
    @Min(1)
    @IsPositive()
    @ApiProperty({default : 1})
    to : number;
}