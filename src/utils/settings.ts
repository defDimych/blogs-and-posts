import dotenv from 'dotenv'
dotenv.config()

export const SETTINGS = {
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URL || 'mongodb://0.0.0.0:27017',
    PATH: {
        BLOGS: '/blogs',
        POSTS: '/posts',
        TESTS: '/testing/all-data',
        USERS: '/users',
        AUTH: '/auth'
    },
    CREDENTIALS: 'admin:qwerty'
}