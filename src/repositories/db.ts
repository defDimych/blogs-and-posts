import {Collection, MongoClient} from "mongodb";
import {BlogDbModel} from "../types/blogs-types/BlogDbModel";
import {PostDbModel} from "../types/posts-types/PostDbModel";
import {UserDbModel} from "../types/users-types/UserDbModel";
import {CommentDbModel} from "../types/comments-type/CommentDbModel";
import {RefreshTokenVersionDbModel} from "../types/auth-types/RefreshTokenVersionDbModel";

// Collections
export let blogsCollection: Collection<BlogDbModel>
export let postsCollection: Collection<PostDbModel>
export let usersCollection: Collection<UserDbModel>
export let commentsCollection: Collection<CommentDbModel>
export let refreshTokenVersionCollection: Collection<RefreshTokenVersionDbModel>


export async function runDb(url: string) {
    const client = new MongoClient(url);
    const db = client.db('blogs-and-posts');

    blogsCollection = db.collection('blogs');
    postsCollection = db.collection('posts');
    usersCollection = db.collection('users');
    commentsCollection = db.collection('comments');
    refreshTokenVersionCollection = db.collection('refresh-token-version');

    try {
        await client.connect();
        await client.db('blogs').command({ ping: 1 });

        console.log('Connected successfully to mongo server');
    } catch {
        console.log("Can't connect to db");

        await client.close();
    }
}