import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsPositive } from "class-validator";

export class FollowRequestDto {
    @Type()
    @IsPositive()
    @IsInt()
    @ApiProperty({default : ''})
    to : number;
}

export class AcceptRequestDto {
    @Type()
    @IsPositive()
    @IsInt()
    @ApiProperty({default : ''})
    from : number;
}

export class RemoveFollowerDto {
    @Type()
    @IsPositive()
    @IsInt()
    @ApiProperty({default : ''})
    from : number;
}

export class RemoveFollowingDto {
    @Type()
    @IsPositive()
    @IsInt()
    @ApiProperty({default : ''})
    to : number;
}