import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString, MinLength } from "class-validator";

export class LoginDto {
    @Type()
    @IsString()
    @MinLength(3)
    @ApiProperty({default : "john123"})
    username : string;

    @Type()
    @IsString()
    @MinLength(8)
    @ApiProperty({default : "12345678"})
    password : string;
}

export class LoginWithFirebaseDto {
    @Type()
    @IsString()
    token : string;
}