import { ApiProperty } from '@nestjs/swagger';

export class UploadMediaDto {
    @ApiProperty({ type: 'string', format: 'binary', isArray: true })
    files: string[];
}