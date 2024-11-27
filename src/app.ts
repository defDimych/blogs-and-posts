import express from 'express';
import {SETTINGS} from "./utils/settings";
import {getBlogsRouter} from "./routes/blogs-router";
import {getPostsRouter} from "./routes/posts-router";
import {getTestingRouter} from "./routes/test-router";
import cors from "cors";
import {getUsersRouter} from "./routes/users-router";
import {getAuthRouter} from "./routes/auth-router";
import {getCommentsRouter} from "./routes/comments-router";

// Create app
export const app = express();

app.use(express.json());
app.use(cors())

app.use(SETTINGS.PATH.AUTH, getAuthRouter());
app.use(SETTINGS.PATH.BLOGS, getBlogsRouter());
app.use(SETTINGS.PATH.POSTS, getPostsRouter());
app.use(SETTINGS.PATH.USERS, getUsersRouter());
app.use(SETTINGS.PATH.TESTS, getTestingRouter());
app.use(SETTINGS.PATH.COMMENTS, getCommentsRouter());

