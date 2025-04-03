import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { StoryEntity } from "src/database/entity/Story.entity";
import { DataSource, In, Repository } from "typeorm";
import { CreateStoryDto } from "./dto/create-story.dto";
import { ClsService } from "nestjs-cls";
import { UserEntity } from "src/database/entity/User.entity";
import { PaginationDto } from "src/shared/dto/pagination.dto";
import { MyStorySelect, StoryFolowingsSelect, StoryListSelect } from "src/shared/selects/story.select";
import { FollowService } from "../follow/follow.service";
import { BanService } from "../ban/ban.service";
import { UserService } from "../user/user.service";
import { StoryActionEntity } from "src/database/entity/StoryAction.entity";
import { StoryActionTypes } from "src/shared/enums/Story.enum";
import { NotificationService } from "../notification/notification.service";
import { NotificationEnum } from "src/shared/enums/Notification.enum";

@Injectable()
export class StoryService {
    private storyRepo: Repository<StoryEntity>
    private storyActionRepo: Repository<StoryActionEntity>

    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private cls: ClsService,
        private followService: FollowService,
        private banService: BanService,
        @Inject(forwardRef(() => UserService))
        private userService: UserService,
        private notificationService : NotificationService
    ) {
        this.storyRepo = this.dataSource.getRepository(StoryEntity)
        this.storyActionRepo = this.dataSource.getRepository(StoryActionEntity)
    }

    async findStory(userId : number, storyId : number){
        let story = await this.storyRepo.findOne({
            where : {
                userId,
                id : storyId
            }
        })

        if(!story) throw new NotFoundException("Story is not found")

        return story
    }

    async create(params: CreateStoryDto) {
        let user = this.cls.get<UserEntity>("user")

        let story = this.storyRepo.create({
            userId: user.id,
            media: { id: params.media }
        })

        await story.save()

        return {
            message: "Story is created successfully"
        }
    }

    async myList(params: PaginationDto) {
        let myUser = this.cls.get<UserEntity>("user")

        let page = (params.page || 1) - 1;
        let limit = params.limit;

        let list = await this.storyRepo.find({
            where: {
                userId: myUser.id
            },
            relations: ['media'],
            select: StoryListSelect,
            order: { createdAt: 'DESC' },
            take: limit,
            skip: page * limit
        })

        return list
    }

    async myStoryActiveList() {
        let user = this.cls.get<UserEntity>("user")

        let list = await this.storyRepo.find({
            where: {
                userId: user.id,
                isActive: true
            },
            relations: ['media', 'actions', 'actions.user', 'actions.user.profile', 'actions.user.profile.image'],
            select: MyStorySelect,
            order: { createdAt: 'DESC' },
        })

        return list
    }

    async userStoryActiveList(id: number) {
        let myUser = this.cls.get<UserEntity>("user")

        if (myUser.id === id) {
            throw new BadRequestException("End point is wrong")
        }

        let user = await this.userService.findUser(id)

        if (!user) throw new NotFoundException("User is not found")

        let isBan = await this.banService.checkBan(myUser.id, user.id)

        if (isBan) throw new ForbiddenException(`You are banned from interacting with user ${user.username}`);

        if (user.isPrivate) {
            let access = await this.followService.checkFollow(myUser.id, user.id)

            if (!access) throw new ForbiddenException(`You need to follow user ${user.username} to view their stories`);
        }

        let list = await this.storyRepo.find({
            where: {
                userId: user.id,
                isActive: true
            },
            relations: ['media'],
            select: StoryListSelect,
            order: { createdAt: 'DESC' },
        })

        return list
    }

    async myFollowerStoryList() {
        let user = this.cls.get<UserEntity>("user");

        let followings = await this.followService.listFollowing(user.id);
        if (followings.length === 0) {
            throw new NotFoundException("Followings is not found");
        }

        let ids = followings.map(item => item.to.id);

        let list = await this.storyRepo.find({
            where: {
                userId: In(ids),
                isActive: true
            },
            relations: ['media', 'user', 'user.profile', 'user.profile.image'],
            select: StoryFolowingsSelect,
        });

        const groupedStories = list.reduce((acc, story) => {
            if (!acc[story.userId]) {
                acc[story.userId] = {
                    user: story.user,
                    stories: [],
                };
            }
            acc[story.userId].stories.push(story);
            return acc;
        }, {});

        let data = Object.values(groupedStories).map((group: any) => {
            group.stories.sort((a: any, b: any) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            group.stories.forEach((story: any) => delete story.user);

            return { data: group.stories, user: group.user };
        });

        return data;
    }

    async deleteStory(id: number) {
        let user = this.cls.get<UserEntity>("user")

        let story = await this.storyRepo.findOne({
            where: {
                id
            }
        })

        if (!story) throw new NotFoundException("Story is not found")

        if (user.id !== story.userId) {
            throw new ForbiddenException(`You are not authorized to delete this story`);
        }

        await this.storyRepo.delete({ id: story.id })

        return {
            message: "Story is deleted successfully"
        }
    }

    //  actions

    async likeStory(id: number) {
        let myUser = this.cls.get<UserEntity>("user")

        let story = await this.storyRepo.findOne({
            where: {
                id,
                isActive: true
            }
        })

        if (!story) throw new NotFoundException("Story is not found")

        if (myUser.id !== story.userId) {
            let user = await this.userService.findUser(story.userId)
            if (!user) throw new NotFoundException("User is not found")

            let isBan = await this.banService.checkBan(myUser.id, story.userId)
            if (isBan) throw new ForbiddenException("You are banned from liking this story")

            if (user.isPrivate) {
                let access = await this.followService.checkFollow(myUser.id, story.userId)
                if (!access) throw new ForbiddenException("You don't have access to like this story")
            }
        }

        let message = ''

        let like = await this.storyActionRepo.findOne({
            where: {
                userId: myUser.id,
                storyId: story.id,
                action: StoryActionTypes.LIKE
            }
        })

        if (like) {
            await this.storyActionRepo.delete({ id: like.id })
            message = 'Like is removed'
        } else {
            like = this.storyActionRepo.create({
                userId: myUser.id,
                storyId: story.id,
                action: StoryActionTypes.LIKE
            })

            await like.save()

            message = 'story is liked successfully'

            if(story.userId !== myUser.id) {
                await this.notificationService.createNotification({
                    userId : story.userId,
                    type : NotificationEnum.LIKE,
                    message : `${myUser.username} liked your story`,
                    storyId : story.id
                })
            }
        }

        return { message }
    }

    async viewStory(id: number) {
        let myUser = this.cls.get<UserEntity>("user")

        let story = await this.storyRepo.findOne({
            where: {
                id,
                isActive: true
            }
        })

        if (!story) throw new NotFoundException("Story is not found")

        if (story.userId === myUser.id) {
            throw new BadRequestException()
         }

        let user = await this.userService.findUser(story.userId)
        if (!user) throw new NotFoundException("User is not found")

        let isBan = await this.banService.checkBan(myUser.id, story.userId)
        if (isBan) throw new ForbiddenException("You are banned from this story")

        if (user.isPrivate) {
            let access = await this.followService.checkFollow(myUser.id, story.userId)
            if (!access) throw new ForbiddenException("You don't have access to view this story")
        }


        let view = await this.storyActionRepo.findOne({
            where: {
                userId: myUser.id,
                storyId: story.id,
                action: StoryActionTypes.VIEW
            }
        })

        if (view) {
            throw new BadRequestException("You have already viewed this story")
        } else {
            view = this.storyActionRepo.create({
                userId: myUser.id,
                storyId: story.id,
                action: StoryActionTypes.VIEW
            })

            await view.save()

            await this.storyRepo.increment({ id: story.id }, "view", 1)
        }

        return {
            message: "Story viewed successfully"
        }
    }
}