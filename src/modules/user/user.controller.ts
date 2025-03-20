import { Controller, Get, Param } from "@nestjs/common";
import { UserService } from "./user.service";

@Controller("user") 
export class UserController {
    constructor(
        private userService : UserService
    ){}

    @Get()
    list(){
        return this.userService.list()
    }
}