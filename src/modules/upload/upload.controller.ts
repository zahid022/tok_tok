import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { UploadService } from "./upload.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { ApiBearerAuth, ApiBody, ApiConsumes } from "@nestjs/swagger";
import { UploadImageDto } from "./dto/upload.dto";
import { imageFileFilter } from "./upload.filter";
import { UPLOAD_IMAGE_MAX_SIZE } from "src/shared/constants/upload.constants";
import { AuthGuard } from "src/shared/guards/Auth.guard";

@Controller('upload')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class UploadController {
    constructor(
        private uploadService: UploadService
    ) { }

    @Post()
    @UseInterceptors(
        FileInterceptor('image', {
            storage: memoryStorage(),
            fileFilter: imageFileFilter,
            limits: {
                fileSize: UPLOAD_IMAGE_MAX_SIZE,
            },
        }),
    )
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: UploadImageDto })
    uploadImage(@UploadedFile() file: Express.Multer.File) {
        return this.uploadService.uploadImage(file);
    }
}