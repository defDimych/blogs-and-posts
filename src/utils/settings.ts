import dotenv from 'dotenv'
dotenv.config()

export const SETTINGS = {
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URL || 'mongodb://0.0.0.0:27017',
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "access_secret",
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "refresh_secret",
    PATH: {
        BLOGS: '/blogs',
        POSTS: '/posts',
        TESTS: '/testing/all-data',
        USERS: '/users',
        AUTH: '/auth',
        COMMENTS: '/comments',
        SECURITY_DEVICES: '/security/devices'
    },
    CREDENTIALS: 'admin:qwerty'
}