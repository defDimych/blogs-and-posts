import {PostInputModel} from "../../types/posts-types/PostInputModel";
import {postsCollection} from "../db";
import {ObjectId} from "mongodb";
import {PostDbModel} from "../../types/posts-types/PostDbModel";

export const postsRepository = {
    async createPost(newPost: PostDbModel): Promise<string> {
        const result = await postsCollection.insertOne(newPost);

        return result.insertedId.toString();
    },

    async updatePost(id: string, { title, shortDescription, content, blogId }: PostInputModel): Promise<boolean> {
        const result = await postsCollection.updateOne(
            { _id: new ObjectId(id) }, { $set: {title, shortDescription, content, blogId} }
        );

        return result.modifiedCount === 1;
    },

    async deletePost(id: string): Promise<boolean> {
        const result = await postsCollection.deleteOne({ _id: new ObjectId(id) });

        return result.deletedCount === 1;
    }
}