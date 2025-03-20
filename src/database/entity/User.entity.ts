import { hash } from "bcrypt";
import { UserProvider } from "src/shared/enums/User.enum";
import { BaseEntity, BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ProfileEntity } from "./Profile.entity";

@Entity('users')
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id : number;

    @Column()
    username : string;

    @Column({nullable : true})
    email : string;

    @Column({nullable : true})
    phone : string;

    @Column()
    password : string;

    @Column({default : false})
    isPrivate : boolean;

    @Column({type : 'enum', enum : UserProvider, default : UserProvider.LOCAL})
    provider : UserProvider

    @Column({nullable : true})
    providerId : string;

    @CreateDateColumn()
    createdAt : Date;

    @UpdateDateColumn()
    updatedAt : Date;

    @BeforeInsert()
    @BeforeUpdate()
    async beforeUpsert(){
        if(!this.password) return

        this.password = await hash(this.password, 10);
    }

    @OneToOne(() => ProfileEntity, (item) => item.user, {cascade : true})
    profile : ProfileEntity
}