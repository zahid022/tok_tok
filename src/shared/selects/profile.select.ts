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
  }
}

export const BasicProfileSelect = {
  id: true,
  image: {
    id: true,
    url: true
  }
}