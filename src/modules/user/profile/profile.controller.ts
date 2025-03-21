import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { AuthGuard } from "src/shared/guards/Auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Controller("user/:id/profile")
export class ProfileController {
    constructor(
        private profileService : ProfileService
    ){}

    @Patch()
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    updateProfile(
        @Param("id") id : number,
        @Body() body : UpdateProfileDto
    ){
        return this.profileService.updateProfile(id, body)
    }

    @Get('me')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    myProfile(){
        return this.profileService.getMyProfile()
    }

    @Get()
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    getProfile(
        @Param("id") id : number
    ){
        return this.profileService.getProfile(id)
    }
}