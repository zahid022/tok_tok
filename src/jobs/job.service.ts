import { Injectable, NotFoundException } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectDataSource } from "@nestjs/typeorm";
import { addHours, subMinutes } from "date-fns";
import { AttemptEntity, LoginAttemptEntity } from "src/database/entity/Attempt.entity";
import { OtpEntity } from "src/database/entity/Otp.entity";
import { ReportEntity } from "src/database/entity/Report.entity";
import { StoryEntity } from "src/database/entity/Story.entity";
import { UserEntity } from "src/database/entity/User.entity";
import { DataSource, LessThan, MoreThan, MoreThanOrEqual, Repository } from "typeorm";

@Injectable()
export class JobService {

    private attemptRepo: Repository<AttemptEntity>
    private otpRepo: Repository<OtpEntity>
    private loginAttemptRepo: Repository<LoginAttemptEntity>
    private storyRepo: Repository<StoryEntity>
    private userRepo: Repository<UserEntity>
    private reportRepo : Repository<ReportEntity>

    constructor(
        @InjectDataSource() private dataSource: DataSource
    ) {
        this.attemptRepo = this.dataSource.getRepository(AttemptEntity)
        this.otpRepo = this.dataSource.getRepository(OtpEntity)
        this.loginAttemptRepo = this.dataSource.getRepository(LoginAttemptEntity)
        this.storyRepo = this.dataSource.getRepository(StoryEntity)
        this.userRepo = this.dataSource.getRepository(UserEntity)
        this.reportRepo = this.dataSource.getRepository(ReportEntity)
    }

    @Cron(CronExpression.EVERY_10_MINUTES)
    async deleteAttempts() {
        await this.attemptRepo.delete({
            attempt: MoreThan(3),
            updatedAt: LessThan(addHours(new Date(), -1)),
        });
    }

    @Cron(CronExpression.EVERY_10_MINUTES)
    async deleteOtpCodes() {
        await this.otpRepo.delete({
            expireTime: LessThan(new Date())
        });
    }

    @Cron(CronExpression.EVERY_10_MINUTES)
    async clearLoginAttempts() {
        await this.loginAttemptRepo.delete({
            createdAt: LessThan(addHours(new Date(), -1)),
        });
    }

    @Cron(CronExpression.EVERY_10_MINUTES)
    async changeStoryStatus() {
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        await this.storyRepo.update(
            { createdAt: LessThan(twentyFourHoursAgo) },
            { isActive: false }
        );
    }

    @Cron(CronExpression.EVERY_10_MINUTES)
    async userReport() {
        await this.userRepo.update(
            { reportCount: MoreThanOrEqual(5) },
            { isReport: true }
        )
    }

    @Cron(CronExpression.EVERY_10_MINUTES)
    async deleteReport(){
        let users = await this.userRepo.find({
            where : {
                isReport : true,
                updatedAt : LessThan(subMinutes(new Date(), 10))
            }
        })

        if(!users) return false

        users.map(async user => {
            await this.userRepo.update({id : user.id}, {isReport : false, reportCount : 0})
            await this.reportRepo.delete({to : user.id})
        })
    }

}