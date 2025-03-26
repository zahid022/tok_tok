import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString, MinLength } from "class-validator";
import { PaginationDto } from "src/shared/dto/pagination.dto";

export class SearchUserDto extends PaginationDto {
    @Type()
    @IsString()
    @MinLength(1)
    @ApiProperty({default : ''})
    name : string
}