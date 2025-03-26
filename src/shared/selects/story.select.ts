
export const StoryListSelect = {
    id: true,
    media: {
        id: true,
        url: true
    },
    view: true,
    createdAt: true,
    isActive: true
}

export const MyStorySelect = {
    ...StoryListSelect,
    actions : {
        id : true,
        action : true,
        user : {
            id : true,
            username: true,
            profile : {
                id : true,
                image : {
                    id : true,
                    url : true
                }
            }
        }
    }
}

export const StoryFolowingsSelect = {
    user: {
        id: true,
        username: true,
        profile: {
            id: true,
            image: {
                id: true,
                url: true
            }
        }
    },
    userId : true,
    ...StoryListSelect
}