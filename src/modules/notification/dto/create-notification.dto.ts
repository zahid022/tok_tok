import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsPositive, IsString, MinLength } from "class-validator";
import { NotificationEnum } from "src/shared/enums/Notification.enum";

export class CreateNotificationDto {
    @Type()
    @IsInt()
    @IsPositive()
    @ApiProperty({default : 0})
    userId : number;

    @Type()
    @IsEnum(NotificationEnum)
    @ApiProperty({default : NotificationEnum.COMMENT})
    type : NotificationEnum;

    @Type()
    @IsString()
    @MinLength(3)
    @ApiProperty({default : ''})
    message : string;

    @Type()
    @IsInt()
    @IsPositive()
    @IsOptional()
    @ApiProperty({default : 0})
    postId?: number;

    @Type()
    @IsInt()
    @IsPositive()
    @IsOptional()
    @ApiProperty({default : 0})
    storyId?: number;

    @Type()
    @IsInt()
    @IsPositive()
    @IsOptional()
    @ApiProperty({default : 0})
    commentId?: number;
}