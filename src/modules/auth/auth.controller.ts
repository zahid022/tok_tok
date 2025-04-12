import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto, LoginWithFirebaseDto } from "./dto/login.dto";
import { ConfirmOtpDto, ForgetPasswordConfirmDto, ForgetPasswordDto } from "./dto/forget-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { AuthGuard } from "src/shared/guards/Auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { CheckDto } from "./dto/check.dto";

@Controller("auth")
export class AuthController {
    constructor(
        private authService : AuthService
    ){}

    @Post("register")
    register(
        @Body() body : RegisterDto
    ){
        return this.authService.register(body)
    }

    @Post("login")
    login(
        @Body() body : LoginDto
    ){
        return this.authService.login(body)
    }

    @Post("otp_confirm")
    otpConfim(
        @Body() body : ConfirmOtpDto
    ){
        return this.authService.confirmOtpCode(body)
    }

    @Post("check")
    check(
        @Body() body : CheckDto
    ){
        return this.authService.check(body)
    }

    @Post("forget_password")
    forgetPassword(
        @Body() body : ForgetPasswordDto    
    ){
        return this.authService.forgetPassword(body)
    }

    @Post("forget_password/confirm")
    forgetPasswordConfirm(
        @Body() body : ForgetPasswordConfirmDto
    ){
        return this.authService.forgetPasswordConfirm(body)
    }

    @Post("reset_password")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    resetPassword(
        @Body() body : ResetPasswordDto
    ){
        return this.authService.resetPassword(body)
    }

    @Post('firebase')
    loginWithFirebase(
        @Body() body : LoginWithFirebaseDto
    ){
        return this.authService.loginWithFirebase(body)
    }
}