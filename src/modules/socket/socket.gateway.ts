import { forwardRef, Inject } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { UserService } from "../user/user.service";

@WebSocketGateway({ cors: { origin: '*' } })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer()
    public server : Server

    constructor(
        private jwt : JwtService,
        @Inject(forwardRef(() => UserService))
        private userService : UserService
    ){}

    handleDisconnect(client: any) {
        console.log("Disconnected")
    }
    handleConnection(client: any, ...args: any[]) {
        console.log("Connected")
    }

    @SubscribeMessage("authorize")
    async userAuthorization(
        @ConnectedSocket() socket : Socket,
        @MessageBody() body : any
    ){
        let {token} = body

        try {
            let payload = this.jwt.verify(token)

            if(!payload.userId) throw new Error()

            let user = await this.userService.findUser(payload.userId)
            if(!user) throw new Error()

            socket.join(`user_${user.id}`)
            socket.data.user = user
            socket.emit("authorization", {status : "success"})
        } catch (error) {
            socket.emit("authorization", {status : "fail"})
        }
    }

}