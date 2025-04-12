import { Type } from "class-transformer";
import { IsString, MinLength } from "class-validator";

export class CheckDto {
    @Type()
    @MinLength(1)
    token: string
}