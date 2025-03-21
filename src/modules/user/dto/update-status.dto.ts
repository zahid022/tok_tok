import { Type } from "class-transformer";
import { IsBoolean } from "class-validator";

export class UpdateStatusDto {
    @Type()
    @IsBoolean()
    isPrivate : boolean
}