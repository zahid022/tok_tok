import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsString, IsUrl, IsUUID, MinLength } from "class-validator";

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

export class ForgetPasswordConfirmDto {
    @Type()
    @IsUUID()
    @ApiProperty({default : ''})
    token : string;

    @Type()
    @IsString()
    @MinLength(4)
    @ApiProperty({default : ''})
    code : string;

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
}