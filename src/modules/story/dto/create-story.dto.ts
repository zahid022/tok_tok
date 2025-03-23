import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsUUID } from "class-validator";

export class CreateStoryDto {
    @Type()
    @IsUUID()
    @ApiProperty({default : ''})
    media: string;
}