import {ExtendedPostViewModel} from "../types/posts-types/PostViewModel";
import {PostInputModel} from "../types/posts-types/PostInputModel";
import {postsCollection} from "./db";
import {ObjectId, WithId} from "mongodb";
import {PostDbModel} from "../types/posts-types/PostDbModel";

const postMapper = (post: WithId<PostDbModel>): ExtendedPostViewModel => {
    return {
        id: post._id.toString(),
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt
    }
}

export const postsRepository = {
    async getAllPosts(): Promise<ExtendedPostViewModel[]> {
        const posts: WithId<PostDbModel>[] = await postsCollection.find({}).toArray();

        return posts.map(postMapper);
    },

    async createPost(newPost: PostDbModel): Promise<ExtendedPostViewModel | null> {
        const result = await postsCollection.insertOne(newPost);
        const postId = result.insertedId.toString();

        const createdPost = postsRepository.findPostById(postId);

        if (createdPost) {
            return createdPost;
        } else {
            throw new Error(`при создани поста с данными ${newPost}, он почему то не вернулся`)
        }
    },

    async findPostById(id: string): Promise<ExtendedPostViewModel | null> {
        const post: WithId<PostDbModel> | null = await postsCollection.findOne({ _id: new ObjectId(id) });

        if (post) {
            return postMapper(post);
        } else {
            return null;
        }
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