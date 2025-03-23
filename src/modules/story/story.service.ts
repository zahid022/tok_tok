import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { StoryEntity } from "src/database/entity/Story.entity";
import { DataSource, Repository } from "typeorm";
import { CreateStoryDto } from "./dto/create-story.dto";
import { ClsService } from "nestjs-cls";
import { UserEntity } from "src/database/entity/User.entity";

@Injectable()
export class StoryService {
    private storyRepo : Repository<StoryEntity>

    constructor(
        @InjectDataSource() private dataSource : DataSource,
        private cls : ClsService
    ){
        this.storyRepo = this.dataSource.getRepository(StoryEntity)
    }

    async create(params : CreateStoryDto){
        let user = this.cls.get<UserEntity>("user")

        let story = this.storyRepo.create({
            userId : user.id,
            media : {id : params.media}
        })

        await story.save()

        return {
            message : "Story is created successfully"
        }
    }
}