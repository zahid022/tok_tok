import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { UserEntity } from "src/database/entity/User.entity";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class UserService {
    private userRepo : Repository<UserEntity>

    constructor(
        @InjectDataSource() private dataSource : DataSource
    ){
        this.userRepo = this.dataSource.getRepository(UserEntity)
    }

    async findUser(id : number) {
        let user = await this.userRepo.findOne({
            where : {id}
        })

        if(!user) throw new NotFoundException("User is not found")

        return user
    }

    list(){
        return this.userRepo.find({})
    }
}