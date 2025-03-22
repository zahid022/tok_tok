import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { MediaEntity } from 'src/database/entity/Media.entity';
import { CloudinaryService } from 'src/libs/cloudinary/cloudinary.service';
import { MediaTypes } from 'src/shared/enums/Media.enum';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class MediaService {
    private mediaRepo: Repository<MediaEntity>;
    constructor(
        private cloudinaryService: CloudinaryService,
        @InjectDataSource() private dataSource: DataSource,
    ) {
        this.mediaRepo = this.dataSource.getRepository(MediaEntity);
    }

    async uploadFiles(files: Express.Multer.File[]) {
        let promises = files.map(this.cloudinaryService.uploadFile);

        let result = await Promise.all(promises);

        let media = result.map((item) =>
            this.mediaRepo.create({
                type: item.type.includes('video') ? MediaTypes.VIDEO : MediaTypes.IMAGE,
                url: item.url,
            }),
        );

        return await this.mediaRepo.save(media);
    }
}