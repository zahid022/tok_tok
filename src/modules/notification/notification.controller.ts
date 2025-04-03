import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { AuthGuard } from "src/shared/guards/Auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { PaginationDto } from "src/shared/dto/pagination.dto";
import { UpdateNotificationDto } from "./dto/update-notification.dto";

@Controller('notification')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class NotificationController {
    constructor(
        private notificationService : NotificationService
    ){}

    @Get()
    list(
        @Query() query : PaginationDto
    ){
        return this.notificationService.list(query)
    }

    @Get(":id")
    item(
        @Param("id") id : number
    ){
        return this.notificationService.item(id)
    }

    @Post()
    updateNotifications(
        @Body() body : UpdateNotificationDto
    ){
        return this.notificationService.updateNotifications(body)
    }
}