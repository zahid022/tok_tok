import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsNumber, IsPositive, IsString, IsUrl, IsUUID, MinLength } from "class-validator";

export class ForgetPasswordDto {
    @Type()
    @IsEmail()
    @ApiProperty({default : ''})
    email : string;

    @Type()
    @IsUrl()
    @ApiProperty({default : ''})
    resetLink : string;
}

export class ConfirmOtpDto {
    @Type()
    @IsString()
    @MinLength(4)
    @ApiProperty({default : ''})
    code : string;
}

export class ForgetPasswordConfirmDto {
    @Type()
    @IsString()
    @MinLength(8)
    @ApiProperty({default : ''})
    newPassword : string;

    @Type()
    @IsString()
    @MinLength(8)
    @ApiProperty({default : ''})
    repeatPassword : string;

    @Type()
    @IsString()
    @MinLength(1)
    @ApiProperty({default : ''})
    token : string;
}