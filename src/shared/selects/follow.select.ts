import { BasicUserSelect } from "./user.select";

export const PendingRequestsSelect = {
    id : true,
    status : true,
    from : BasicUserSelect
}

export const FollowersSelect = {
    id : true,
    from : BasicUserSelect
}

export const FollowingsSelect = {
    id : true,
    to : BasicUserSelect
}