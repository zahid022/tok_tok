import { Module } from "@nestjs/common";
import { JobService } from "./job.service";

@Module({
    imports: [],
    controllers: [],
    providers: [JobService]
})
export class JobModule { }