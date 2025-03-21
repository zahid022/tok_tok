import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsOptional } from "class-validator";

export class UpdateEmailDto {
    @Type()
    @IsEmail()
    @IsOptional()
    @ApiProperty({ default: 'john@example.com' })
    email: string;
}