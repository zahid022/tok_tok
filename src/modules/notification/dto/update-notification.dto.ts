import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber } from "class-validator";

export class UpdateNotificationDto {
    @Type()
    @IsNumber({}, {each : true})
    @ApiProperty({default : []})
    ids : number[]
}