import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("reports")
export class ReportEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id : number;

    @Column()
    from : number;

    @Column()
    to : number;

    @Column({nullable : true})
    text : string;

    @CreateDateColumn({type : 'timestamptz'})
    createdAt : Date;

    @UpdateDateColumn({type : 'timestamptz'})
    updatedAt : Date;
}