import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectDataSource } from "@nestjs/typeorm";
import { addHours } from "date-fns";
import { AttemptEntity, LoginAttemptEntity } from "src/database/entity/Attempt.entity";
import { OtpEntity } from "src/database/entity/Otp.entity";
import { DataSource, LessThan, MoreThan, Repository } from "typeorm";

@Injectable()
export class JobService {

    private attemptRepo: Repository<AttemptEntity>
    private otpRepo: Repository<OtpEntity>
    private loginAttemptRepo : Repository<LoginAttemptEntity>

    constructor(
        @InjectDataSource() private dataSource: DataSource
    ) {
        this.attemptRepo = this.dataSource.getRepository(AttemptEntity)
        this.otpRepo = this.dataSource.getRepository(OtpEntity)
        this.loginAttemptRepo = this.dataSource.getRepository(LoginAttemptEntity)
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
}