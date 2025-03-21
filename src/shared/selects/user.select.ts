import { BasicProfileSelect } from "./profile.select";

export const BasicUserSelect = {
    id: true,
    username: true,
    isPrivate: true,
    profile: BasicProfileSelect
}