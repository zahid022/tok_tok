import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterDto {
    @Type()
    @IsString()
    @MinLength(3)
    @ApiProperty({default : 'John123'})
    username : string;

    @Type()
    @IsEmail()
    @IsOptional()
    @ApiProperty({default : 'john@example.com'})
    email : string;

    @Type()
    @IsString()
    @IsOptional()
    @MinLength(3)
    @ApiProperty({default : '+994772700818'})
    phone : string

    @Type()
    @IsString()
    @MinLength(3)
    @ApiProperty({default : 'John Doe'})
    fullName : string

    @Type()
    @IsString()
    @MinLength(8)
    @ApiProperty({default : '12345678'})
    password : string;
}