import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ReportService } from "./report.service";
import { AuthGuard } from "src/shared/guards/Auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { CreateReportDto } from "./dto/create-report.dto";

@Controller("report")
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ReportController {
    constructor(
        private reportService : ReportService
    ){}

    @Post()
    report(
        @Body() body : CreateReportDto
    ){
        return this.reportService.report(body)
    }
}