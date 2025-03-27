import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { ReportEntity } from "src/database/entity/Report.entity";
import { DataSource, Repository } from "typeorm";
import { CreateReportDto } from "./dto/create-report.dto";
import { ClsService } from "nestjs-cls";
import { UserEntity } from "src/database/entity/User.entity";
import { UserService } from "../user/user.service";

@Injectable()
export class ReportService {
    private reportRepo : Repository<ReportEntity>

    constructor(
        @InjectDataSource() private dataSource : DataSource,
        private cls : ClsService,
        private userService : UserService
    ){
        this.reportRepo = this.dataSource.getRepository(ReportEntity)
    }

    async report(params  : CreateReportDto){
        let myUser = this.cls.get<UserEntity>("user")

        let user = await this.userService.findUser(params.to)

        if(!user) throw new NotFoundException("User is not found")

        let checkReport = await this.reportRepo.exists({
            where : {
                from : myUser.id,
                to : user.id
            }
        })

        if(checkReport){
            throw new BadRequestException("Report is already exists")
        }

        let report = this.reportRepo.create({
            from : myUser.id,
            to : user.id,
            text : params.text
        })

        await report.save()

        await this.userService.incrementReportCount(user.id)

        return {
            message : "Report is created successfully"
        }
    }
}