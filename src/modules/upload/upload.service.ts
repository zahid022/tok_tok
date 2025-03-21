import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { ImageEntity } from "src/database/entity/Image.entity";
import { CloudinaryService } from "src/libs/cloudinary/cloudinary.service";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class UploadService {
    private imageRepo: Repository<ImageEntity>

    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private cloudinaryService: CloudinaryService
    ) {
        this.imageRepo = this.dataSource.getRepository(ImageEntity)
    }

    async uploadImage(file: Express.Multer.File) {
        try {
            let result = await this.cloudinaryService.uploadFile(file);
            if (!result?.url) throw new Error();

            let image = this.imageRepo.create({
                url: result.url,
            });

            await image.save();

            return image;
        } catch {
            throw new BadRequestException('Something went wrong');
        }
    }
}