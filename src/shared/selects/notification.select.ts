export const NotificationSelect = {
    id : true,
    userId : true,
    sender : {
        id : true,
        username : true,
        profile : {
            id : true,
            image : {
                id : true,
                url : true
            }
        }
    },
    post : {
        id : true,
        media : {
            id : true,
            url : true
        }
    },
    comment : {
        id : true,
        content : true
    },
    story : {
        id : true,
        media : {
            id : true,
            url : true
        }
    },
    type : true,
    message : true,
    read : true,
    createdAt : true
}