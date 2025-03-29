import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { MessageMediaEntity } from "src/database/entity/MessageMedia.entity";
import { CloudinaryService } from "src/libs/cloudinary/cloudinary.service";
import { MessageMediaTypes } from "src/shared/enums/Media.enum";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class MessageMediaService {
    private messageMediaRepo: Repository<MessageMediaEntity>

    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private cloudinaryService: CloudinaryService
    ) {
        this.messageMediaRepo = this.dataSource.getRepository(MessageMediaEntity)
    }

    async uploadVoice(file: Express.Multer.File) {

        try {
            let result = await this.cloudinaryService.uploadFile(file)
            if (!result?.url) throw new Error();

            let media = this.messageMediaRepo.create({
                url: result.url,
                type: MessageMediaTypes.AUDIO
            })

            await media.save()

            return media
        } catch {
            throw new BadRequestException('Something went wrong');
        }
    }

    async uploadMedia(file: Express.Multer.File) {
        try {
            let result = await this.cloudinaryService.uploadFile(file);
            if (!result?.url) throw new Error();

            let media = this.messageMediaRepo.create({
                url: result.url,
                type : result.type.includes('video') ? MessageMediaTypes.VIDEO : MessageMediaTypes.IMAGE,
            });

            await media.save();

            return media;
        } catch {
            throw new BadRequestException('Something went wrong');
        }
    }
}