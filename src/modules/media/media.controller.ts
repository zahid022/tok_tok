import { Controller, Post, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { MediaService } from "./media.service";
import { AuthGuard } from "src/shared/guards/Auth.guard";
import { ApiBearerAuth, ApiBody, ApiConsumes } from "@nestjs/swagger";
import { FilesInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { UploadMediaDto } from "./dto/upload-media.dto";
import { mediaFileFilter } from "./media.filter";
import { UPLOAD_MEDIA_MAX_SIZE } from "src/shared/constants/media.constants";

@Controller("media")
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class MediaController {
    constructor(
        private mediaService: MediaService
    ) { }

    @Post()
    @UseInterceptors(
        FilesInterceptor('files', 10, {
            storage: memoryStorage(),
            fileFilter: mediaFileFilter,
            limits: {
                fileSize: UPLOAD_MEDIA_MAX_SIZE,
            },
        }),
    )
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: UploadMediaDto })
    uploadImage(@UploadedFiles() files: Express.Multer.File[]) {
        return this.mediaService.uploadFiles(files);
    }
}