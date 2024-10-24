import {MongoClient} from "mongodb";
import {SETTINGS} from "../utils/settings";
import {ExtendedBlogViewModel} from "../types/blogs-types/BlogViewModel";

export const client = new MongoClient(SETTINGS.MONGO_URI);

export async function runDb() {
    try {
        await client.connect();
        await client.db('blogs').command({ ping: 1 });

        console.log('Connected successfully to mongo server');
    } catch {
        console.log("Can't connect to db");

        await client.close();
    }
}

// Collections
export const blogsCollection = client.db('blogs-and-posts').collection<ExtendedBlogViewModel>('blogs');