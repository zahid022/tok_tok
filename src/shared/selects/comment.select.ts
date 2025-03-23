import { BasicUserSelect } from "./user.select";

export const CommentSelect: any = {};

CommentSelect.id = true;
CommentSelect.content = true;
CommentSelect.user = BasicUserSelect;
CommentSelect.parentCommentId = true;
CommentSelect.replies = CommentSelect; 
CommentSelect.createdAt = true;
CommentSelect.updatedAt = true;
