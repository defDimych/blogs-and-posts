import express from 'express';
import {SETTINGS} from "./utils/settings";
import {usersRouter} from "./routes/blogs/blogs-router";
import {postsRouter} from "./routes/posts/posts-router";
import {getTestingRouter} from "./routes/test-router";
import cors from "cors";
import {authRouter} from "./routes/auth/auth-router";
import {commentsRouter} from "./routes/comments/comments-router";
import cookieParser from "cookie-parser";
import {securityDevicesRouter} from "./routes/security-devices-router";

// Create app
export const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors())

app.use(SETTINGS.PATH.AUTH, authRouter);
app.use(SETTINGS.PATH.BLOGS, usersRouter);
app.use(SETTINGS.PATH.POSTS, postsRouter);
app.use(SETTINGS.PATH.USERS, usersRouter);
app.use(SETTINGS.PATH.TESTS, getTestingRouter());
app.use(SETTINGS.PATH.COMMENTS, commentsRouter);
app.use(SETTINGS.PATH.SECURITY_DEVICES, securityDevicesRouter);
