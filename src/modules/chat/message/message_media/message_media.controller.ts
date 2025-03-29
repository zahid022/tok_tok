import { Controller, Param, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { MessageMediaService } from "./message_media.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes } from "@nestjs/swagger";
import { UploadMessageMediaDto, UploadMessageVoiceDto } from "./dto/create-message-media.dto";
import { memoryStorage } from "multer";

@Controller("message/media")
export class MessageMediaController {
    constructor(
        private messageMediaService: MessageMediaService
    ) { }

    @Post()
    @UseInterceptors(
        FileInterceptor('media', {
            storage: memoryStorage()
        }),
    )
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: UploadMessageMediaDto })
    uploadImage(@UploadedFile() file: Express.Multer.File) {
        return this.messageMediaService.uploadMedia(file);
    }

    @Post('upload-voice')
    @UseInterceptors(FileInterceptor('voice', {
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.startsWith("audio/")) {
                return cb(new Error("Only audio files are allowed!"), false);
            }
            cb(null, true);
        }
    }))
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: UploadMessageVoiceDto })
    async uploadVoice(
        @UploadedFile() file: Express.Multer.File
    ) {
        return this.messageMediaService.uploadVoice(file)
    }
}