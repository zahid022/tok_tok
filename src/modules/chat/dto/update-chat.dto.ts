import { PartialType } from "@nestjs/swagger";
import { CreateChatGroupDto } from "./create-chat-group.dto";

export class UpdateChatDto extends PartialType(CreateChatGroupDto) {}