import {Collection, MongoClient} from "mongodb";
import {BlogDbModel} from "../types/blogs-types/BlogDbModel";
import {PostDbModel} from "../types/posts-types/PostDbModel";

// Collections
export let blogsCollection: Collection<BlogDbModel>
export let postsCollection: Collection<PostDbModel>

export async function runDb(url: string) {
    const client = new MongoClient(url);
    const db = client.db('blogs-and-posts');

    blogsCollection = db.collection('blogs');
    postsCollection = db.collection('posts');

    try {
        await client.connect();
        await client.db('blogs').command({ ping: 1 });

        console.log('Connected successfully to mongo server');
    } catch {
        console.log("Can't connect to db");

        await client.close();
    }
}