export const MyProfileSelect = {
  id: true,
  fullName: true,
  birth: true,
  occupation: true,
  bio: true,
  follower: true,
  following: true,
  postCount: true,
  image: {
    id: true,
    url: true,
    createdAt: true,
    updatedAt: true
  },
  user: {
    id : true,
    username : true,
    email : true,
    phone : true,
    isPrivate : true
  }
}

export const ProfileSelect = {
  id: true,
  fullName: true,
  birth: true,
  occupation: true,
  bio: true,
  follower: true,
  following: true,
  postCount: true,
  image: {
    id: true,
    url: true,
    createdAt: true,
    updatedAt: true
  },
  user: {
    id : true,
    username : true,
    isPrivate : true
  }
}

export const BasicProfileSelect = {
  id: true,
  image: {
    id: true,
    url: true
  }
}