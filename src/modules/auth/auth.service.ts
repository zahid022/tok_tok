import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { UserEntity } from "src/database/entity/User.entity";
import { DataSource, FindOptionsWhere, In, MoreThan, Repository } from "typeorm";
import { RegisterDto } from "./dto/register.dto";
import { UserAttemptType, UserProvider } from "src/shared/enums/User.enum";
import { JwtService } from "@nestjs/jwt";
import { LoginDto, LoginWithFirebaseDto } from "./dto/login.dto";
import { compare } from "bcrypt";
import { MailerService } from "@nestjs-modules/mailer";
import { ConfirmOtpDto, ForgetPasswordConfirmDto, ForgetPasswordDto } from "./dto/forget-password.dto";
import { OtpEntity } from "src/database/entity/Otp.entity";
import { generate } from 'otp-generator';
import { addMinutes } from "date-fns";
import { AttemptEntity, LoginAttemptEntity } from "src/database/entity/Attempt.entity";
import { v4 } from "uuid";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { ClsService } from "nestjs-cls";
import { FirebaseService } from "src/libs/firebase/firebase.service";
import { ImageEntity } from "src/database/entity/Image.entity";
import { CheckDto } from "./dto/check.dto";

@Injectable()
export class AuthService {
    private userRepo: Repository<UserEntity>
    private otpRepo: Repository<OtpEntity>
    private attemptRepo: Repository<AttemptEntity>
    private imageRepo: Repository<ImageEntity>
    private loginAttemptRepo: Repository<LoginAttemptEntity>

    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private jwt: JwtService,
        private mailService: MailerService,
        private cls: ClsService,
        private firebaseService: FirebaseService
    ) {
        this.userRepo = this.dataSource.getRepository(UserEntity)
        this.otpRepo = this.dataSource.getRepository(OtpEntity)
        this.attemptRepo = this.dataSource.getRepository(AttemptEntity)
        this.imageRepo = this.dataSource.getRepository(ImageEntity)
        this.loginAttemptRepo = this.dataSource.getRepository(LoginAttemptEntity)
    }

    async register(params: RegisterDto) {
        if (!params.email && !params.phone) throw new BadRequestException("Email or phone is required")

        let username = params.username.toLowerCase()
        let email = params.email?.toLowerCase()
        let phone = params.phone

        let where: FindOptionsWhere<UserEntity>[] = [
            { username }
        ]

        if (params.email) {
            where.push({
                email
            })
        }

        if (params.phone) {
            where.push({
                phone
            })
        }

        let existUser = await this.userRepo.findOne({ where })

        if (existUser) {
            if (existUser.username === username) {
                throw new ConflictException({
                    message: "Username is already exists",
                    suggetions: await this.suggetionsUsername(username)
                })
            } else if (existUser.email === email) {
                throw new ConflictException("Email is already exists")
            } else if (existUser.phone === phone) {
                throw new ConflictException("Phone is already exists")
            }
        }

        let user = this.userRepo.create({
            email,
            phone,
            username,
            password: params.password,
            profile: {
                fullName: params.fullName
            }
        })

        await user.save()

        let token = this.generateToken(user.id)

        if (email) {
            await this.mailService.sendMail({
                to: email,
                subject: 'Welcome to Tok Tok',
                template: 'welcome',
                context: {
                    username: user.username
                }
            })
        }

        return {
            message: "User is created successfully",
            token,
            id: user.id
        }
    }

    check(params: CheckDto) {
        try {
            this.jwt.verify(params.token);
            return {status : true}
        } catch {
            return {status : false}
        }
    }

    generateToken(id: number) {
        let token = this.jwt.sign({ userId: id })

        return token
    }

    async suggetionsUsername(username: string) {

        username = username
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/^-+|-+$/g, '');

        let suggestions = Array.from({ length: 10 }).map((_) => `${username}${Math.floor(Math.random() * 1000)}`)

        let checkUsernames = await this.userRepo.find({
            where: {
                username: In(suggestions)
            },
            select: {
                id: true,
                username: true
            }
        })

        let existUsername = checkUsernames.map((user) => user.username)

        suggestions = suggestions.filter(item => !existUsername.includes(item))

        return suggestions.slice(0, 2)
    }

    async login(params: LoginDto) {
        let identifer = params.username.toLowerCase()

        let where: FindOptionsWhere<UserEntity>[] = [
            {
                username: identifer
            },
            {
                email: identifer
            },
            {
                phone: identifer
            }
        ]

        let user = await this.userRepo.findOne({ where })

        if (!user) throw new UnauthorizedException("Username or password is wrong")

        await this.checkLoginAttempts(user)

        let checkPaasword = await compare(params.password, user.password)

        if (!checkPaasword) {
            await this.addLoginAttempts(user)
            throw new UnauthorizedException("Username or password is wrong")
        }

        await this.clearAllAttempts(user)

        if (user.isReport) {
            throw new BadRequestException("You are ban")
        }

        let token = this.generateToken(user.id)

        return {
            token,
            id: user.id
        }
    }

    async forgetPassword(params: ForgetPasswordDto) {
        let user = await this.userRepo.findOne({ where: { email: params.email } })

        if (!user) throw new NotFoundException("Email is not found")

        let attemptCheck = await this.attemptRepo.findOne({
            where: {
                userId: user.id,
                type: UserAttemptType.FORGET_PASSWORD
            }
        })

        if (!attemptCheck) {
            attemptCheck = this.attemptRepo.create({
                userId: user.id,
                type: UserAttemptType.FORGET_PASSWORD,
                attempt: 0
            })
        }

        if (attemptCheck.attempt > 3) {
            throw new HttpException(
                'Try again in 1 hour',
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        let otp = await this.otpRepo.findOne({
            where: {
                userId: user.id,
                expireTime: MoreThan(new Date()),
            }
        })

        if (!otp) {
            const code = generate(4, {
                digits: true,
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            });

            otp = this.otpRepo.create({
                userId: user.id,
                code,
                expireTime: addMinutes(new Date(), 30),
                token: v4()
            })

            await otp.save()
        }


        try {
            await this.mailService.sendMail({
                to: user.email,
                subject: `Forget Password Request`,
                template: 'forget-password',
                context: {
                    username: user.username,
                    code: otp.code,
                    resetLink: params.resetLink
                },
            });

            attemptCheck.attempt += 1

            await attemptCheck.save()
        } catch (error) {
            throw new InternalServerErrorException("Email sent is failed")
        }

        return {
            message: "Email is sent successfully"
        }
    }

    async confirmOtpCode(params: ConfirmOtpDto) {
        let otp = await this.otpRepo.findOne({
            where: {
                code: params.code,
                expireTime: MoreThan(new Date())
            }
        })

        if (!otp) throw new NotFoundException("Otp code is wrong")

        return {
            token: otp.token
        }
    }

    async forgetPasswordConfirm(params: ForgetPasswordConfirmDto) {
        if (params.newPassword !== params.repeatPassword) {
            throw new BadRequestException("Repeat password is not match with new password");
        }

        let otp = await this.otpRepo.findOne({
            where: {
                token: params.token,
                expireTime: MoreThan(new Date())
            }
        })

        if (!otp) throw new BadRequestException("Token is invalid")

        const [user, attemptCheck] = await Promise.all([
            this.userRepo.findOne({
                where: { id: otp.userId }
            }),
            this.attemptRepo.findOne({
                where: {
                    userId: otp.userId,
                    type: UserAttemptType.WRONG_OTP_CODE
                }
            })
        ]);

        if (!user) throw new NotFoundException("User is not found");

        const attempt = attemptCheck || this.attemptRepo.create({
            userId: user.id,
            type: UserAttemptType.WRONG_OTP_CODE,
            attempt: 0
        });

        if (attempt.attempt > 3) {
            throw new HttpException(
                'Too many requests',
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        user.password = params.newPassword;

        await Promise.all([
            user.save(),
            this.attemptRepo.delete({ userId: user.id }),
            this.otpRepo.delete({ userId: user.id })
        ]);

        const token = this.generateToken(user.id);

        return {
            message: 'Password is updated successfully',
            token,
            id: user.id
        };
    }

    async resetPassword(params: ResetPasswordDto) {
        if (params.newPassword !== params.repeatPassword) {
            throw new BadRequestException("Repeat password is not match with new password")
        }
        let user = this.cls.get<UserEntity>("user")

        let checkPassword = await compare(params.currentPassword, user.password)

        if (!checkPassword) throw new BadRequestException("Current password is wrong")

        user.password = params.newPassword

        await user.save()

        return {
            message: "Password is updated successfully"
        }
    }

    async loginWithFirebase(params: LoginWithFirebaseDto) {
        let admin = this.firebaseService.firebaseApp

        let result = await admin.auth().verifyIdToken(params.token)

        if (!result?.uid) throw new InternalServerErrorException("Something went wrong")

        let email = result.email
        let uuid = result.uid

        let where: FindOptionsWhere<UserEntity>[] = [
            {
                providerId: uuid,
                provider: UserProvider.FIREBASE
            }
        ]

        if (email) {
            where.push({
                email
            })
        }

        let user = await this.userRepo.findOne({ where })

        if (!user) {
            let findUsername = result.name ? result.name : result.email?.split('.')[0]
            let usernames = await this.suggetionsUsername(findUsername)

            let image = result.picture
                ? await this.imageRepo.save({
                    url: result.picture,
                })
                : undefined;

            user = this.userRepo.create({
                password: v4(),
                username: usernames[0],
                provider: UserProvider.FIREBASE,
                providerId: uuid,
                email,
                profile: {
                    fullName: result.name,
                    imageId: image?.id
                }
            })

            await user.save()

            await this.mailService.sendMail({
                to: email,
                subject: 'Welcome to Tok Tok',
                template: 'welcome',
                context: {
                    username: user.username
                }
            })
        }

        if (user.isReport) {
            throw new BadRequestException("You are ban")
        }

        let token = this.generateToken(user.id)

        return {
            token
        }
    }

    async checkLoginAttempts(user: UserEntity) {
        let ip = this.cls.get("ip")

        let attempts = await this.loginAttemptRepo.count({
            where: {
                ip,
                userId: user.id
            }
        })

        if (attempts > 5) {
            throw new HttpException(
                'Please try again later',
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }
    }

    async addLoginAttempts(user: UserEntity) {
        let ip = this.cls.get("ip")

        let attempt = this.loginAttemptRepo.create({
            ip,
            userId: user.id,
            createdAt: new Date()
        })

        await attempt.save()

        return true
    }

    async clearAllAttempts(user: UserEntity) {
        let ip = this.cls.get("ip")

        await this.loginAttemptRepo.delete({
            userId: user.id,
            ip
        })
    }
}