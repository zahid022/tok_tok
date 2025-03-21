import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString, MinLength } from "class-validator";

export class UpdateUsernameDto {
    @Type()
    @IsString()
    @MinLength(3)
    @ApiProperty({ default: 'John123' })
    username: string;
}