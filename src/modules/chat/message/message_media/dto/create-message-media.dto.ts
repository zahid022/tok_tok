import { ApiProperty } from "@nestjs/swagger";

export class UploadMessageVoiceDto {
    @ApiProperty({ type: 'string', format: 'binary' })
    voice: any;
}

export class UploadMessageMediaDto {
    @ApiProperty({ type: 'string', format: 'binary' })
    media: any;
}

