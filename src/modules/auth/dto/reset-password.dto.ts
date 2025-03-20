import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
    @Type()
    @IsString()
    @MinLength(8)
    @ApiProperty({default : '12345678'})
    currentPassword : string;

    @Type()
    @IsString()
    @MinLength(8)
    @ApiProperty({default : '123456789'})
    newPassword : string;

    @Type()
    @IsString()
    @MinLength(8)
    @ApiProperty({default : '123456789'})
    repeatPassword : string;
}