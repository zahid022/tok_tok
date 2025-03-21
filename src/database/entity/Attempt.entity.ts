import { UserAttemptType } from "src/shared/enums/User.enum";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("attempts")
export class AttemptEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column({type : 'enum', enum : UserAttemptType})
    type : UserAttemptType

    @Column({nullable : true})
    attempt : number;

    @CreateDateColumn({type : 'timestamptz'})
    createdAt : Date;

    @UpdateDateColumn({type : 'timestamptz'})
    updatedAt : Date;
}

@Entity('login_attempts')
export class LoginAttemptEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id : number;

    @Column()
    ip : string;

    @Column()
    userId : number;

    @CreateDateColumn({type : 'timestamptz'})
    createdAt : Date;
}