import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CretaeHighlightDto } from "./dto/create-highlight.dto";
import { DataSource, Repository } from "typeorm";
import { HighlightEntity } from "src/database/entity/Highlight.entity";
import { HighlightStoryEntity } from "src/database/entity/HighlightStory.entity";
import { InjectDataSource } from "@nestjs/typeorm";
import { ClsService } from "nestjs-cls";
import { UserEntity } from "src/database/entity/User.entity";
import { StoryService } from "../story/story.service";
import { UserService } from "../user/user.service";
import { BanService } from "../ban/ban.service";
import { FollowService } from "../follow/follow.service";
import { HighlightSelect } from "src/shared/selects/highlights.selects";
import { HighlightStoryDto } from "./dto/create-highlight-story.dto";

@Injectable()
export class HighlightService {
    private highlightRepo: Repository<HighlightEntity>
    private highlightStoryRepo: Repository<HighlightStoryEntity>

    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private cls: ClsService,
        private storyService: StoryService,
        private userService: UserService,
        private banService: BanService,
        private followService: FollowService
    ) {
        this.highlightRepo = this.dataSource.getRepository(HighlightEntity)
        this.highlightStoryRepo = this.dataSource.getRepository(HighlightStoryEntity)
    }

    async item(id: number) {
        let myUser = this.cls.get<UserEntity>("user")

        let highlight = await this.highlightRepo.findOne({
            where: { id },
            relations: ["highlightStories", "highlightStories.story", "highlightStories.story.media"],
            select: HighlightSelect
        })

        if (!highlight) throw new NotFoundException("Highlight is not found")

        if (highlight.userId !== myUser.id) {
            let user = await this.userService.findUser(highlight.userId)
            if (!user) throw new NotFoundException("User is not found")

            let isBan = await this.banService.checkBan(myUser.id, user.id)
            if (isBan) throw new ForbiddenException("You are banned from interacting with this user")

            if (user.isPrivate) {
                let access = await this.followService.checkFollow(myUser.id, user.id)
                if (!access) throw new ForbiddenException("You do not have permission to view this profile")
            }
        }

        return highlight
    }

    async highlightList(id: number) {
        let myUser = this.cls.get<UserEntity>("user")

        if (myUser.id !== id) {
            let user = await this.userService.findUser(id)
            if (!user) throw new NotFoundException("User is not found")

            let isBan = await this.banService.checkBan(myUser.id, user.id)
            if (isBan) throw new ForbiddenException("You are banned from interacting with this user")

            if (user.isPrivate) {
                let access = await this.followService.checkFollow(myUser.id, user.id)
                if (!access) throw new ForbiddenException("You do not have permission to view this profile")
            }
        }

        let list = await this.highlightRepo.find({
            where: {
                userId: myUser.id !== id ? id : myUser.id
            },
            order: { createdAt: "DESC" }
        })

        return list
    }

    async createHighlight(params: CretaeHighlightDto) {
        let myUser = this.cls.get<UserEntity>("user")

        let story = await this.storyService.findStory(myUser.id, params.storyId)

        if (!story) throw new NotFoundException("Story is not found")

        let highlight = this.highlightRepo.create({
            name: params.name,
            userId: myUser.id
        })

        await highlight.save()

        let highlightStory = this.highlightStoryRepo.create({
            storyId: story.id,
            highlightId: highlight.id
        })

        await highlightStory.save()

        return {
            message: "Highlight is created successfully"
        }
    }

    async add(id: number, params: HighlightStoryDto) {
        let myUser = this.cls.get<UserEntity>("user")

        let highlight = await this.highlightRepo.findOne({
            where: {
                id,
                userId: myUser.id
            }
        })

        if (!highlight) throw new NotFoundException("Highlight is not found")

        let story = await this.storyService.findStory(myUser.id, params.storyId)

        if (!story) throw new NotFoundException("Story is not found")

        let highlightStory = this.highlightStoryRepo.create({
            highlightId: highlight.id,
            storyId: story.id
        })

        await highlightStory.save()

        return {
            message: "Story has been added successfully"
        }
    }

    async remove(id: number, params: HighlightStoryDto) {
        let myUser = this.cls.get<UserEntity>("user")

        let highlight = await this.highlightRepo.findOne({
            where: {
                id,
                userId: myUser.id
            }
        })

        if (!highlight) throw new NotFoundException("Highlight is not found")

        let highlightStory = await this.highlightStoryRepo.findOne({
            where: {
                storyId: params.storyId,
                highlightId: highlight.id
            }
        })

        if (!highlightStory) throw new NotFoundException("Story is not found")

        await this.highlightStoryRepo.delete({ id: highlightStory.id })

        return {
            message: "Story removed successfully"
        }
    }

    async delete(id: number) {
        let myUser = this.cls.get<UserEntity>("user")

        let highlight = await this.highlightRepo.findOne({
            where: { id, userId: myUser.id }
        })

        if(!highlight) throw new NotFoundException("Highlight is not found")

        await this.highlightRepo.delete({id : highlight.id})

        return {
            message : "Highlight is deleted successfully"
        }
    }
}