import {Collection, MongoClient} from "mongodb";
import {ExtendedBlogViewModel} from "../types/blogs-types/BlogViewModel";
import {ExtendedPostViewModel} from "../types/posts-types/PostViewModel";

// Collections
export let blogsCollection: Collection<ExtendedBlogViewModel>;
export let postsCollection: Collection<ExtendedPostViewModel>

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