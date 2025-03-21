import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsString, IsUUID, MinLength } from "class-validator";

export class UpdateProfileDto {
    @Type()
    @MinLength(3)
    @IsString()
    @IsOptional()
    @ApiProperty({default : ''})
    fullName : string;

    @Type()
    @IsString()
    @MinLength(3)
    @IsOptional()
    @ApiProperty({default : ''})
    birth : string;

    @Type()
    @IsString()
    @MinLength(2)
    @IsOptional()
    @ApiProperty({default : ''})
    occupation : string;

    @Type()
    @IsString()
    @MinLength(3)
    @IsOptional()
    @ApiProperty({default : ''})
    bio : string;

    @Type()
    @IsUUID()
    @IsOptional()
    @ApiProperty({default : 'fa45b86b-5b2b-4365-a5ec-3a2d41f4dfe6'})
    imageId : string;
}