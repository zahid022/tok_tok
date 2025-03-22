import { BasicUserSelect } from "./user.select";

export const PostsSelect = {
    id : true,
    content : true,
    isActive : true,
    like : true,
    view : true,
    commentCount : true,
    createdAt : true,
    updatedAt : true,
    media : {
        id : true,
        url : true
    },
    taggedUsers : {
        id : true,
        username : true
    },
    user : BasicUserSelect
}