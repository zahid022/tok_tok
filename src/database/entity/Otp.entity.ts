import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("otp_codes")
export class OtpEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id : number;

    @Column()
    userId : number;

    @Column()
    code : string;

    @Column()
    token : string;

    @Column()
    expireTime : Date;
}