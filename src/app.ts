import express from 'express';
import {SETTINGS} from "./utils/settings";
import {getBlogsRouter} from "./routes/blogs-router";
import {getPostsRouter} from "./routes/posts-router";
import {getTestingRouter} from "./routes/test-router";

// Create app
export const app = express();

app.use(express.json());

app.use(SETTINGS.PATH.BLOGS, getBlogsRouter());
app.use(SETTINGS.PATH.POSTS, getPostsRouter());
app.use(SETTINGS.PATH.TESTS, getTestingRouter());