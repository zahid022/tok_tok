import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, Max, Min } from 'class-validator';

export class PaginationDto {
    @Type()
    @IsInt()
    @IsPositive()
    @IsOptional()
    page: number = 1;

    @Type()
    @IsInt()
    @Min(1)
    @Max(100)
    @IsPositive()
    @IsOptional()
    limit: number = 10;
}