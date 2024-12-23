import {Collection, MongoClient} from "mongodb";
import {BlogDbModel} from "../types/blogs-types/BlogDbModel";
import {PostDbModel} from "../types/posts-types/PostDbModel";
import {UserDbModel} from "../types/users-types/UserDbModel";
import {CommentDbModel} from "../types/comments-type/CommentDbModel";
import {RequestLogDbModel} from "../types/auth-types/RequestLogDbModel";
import {SessionDbModel} from "../types/auth-types/SessionDbModel";

// Collections
export let blogsCollection: Collection<BlogDbModel>
export let postsCollection: Collection<PostDbModel>
export let usersCollection: Collection<UserDbModel>
export let commentsCollection: Collection<CommentDbModel>
export let activeSessionsCollection: Collection<SessionDbModel>
export let requestLogCollection: Collection<RequestLogDbModel>


export async function runDb(url: string) {
    const client = new MongoClient(url);
    const db = client.db('blogs-and-posts');

    blogsCollection = db.collection('blogs');
    postsCollection = db.collection('posts');
    usersCollection = db.collection('users');
    commentsCollection = db.collection('comments');
    activeSessionsCollection = db.collection('active-sessions');
    requestLogCollection = db.collection('request-logs');

    try {
        await client.connect();
        await client.db('blogs').command({ ping: 1 });

        console.log('Connected successfully to mongo server');
    } catch {
        console.log("Can't connect to db");

        await client.close();
    }
}