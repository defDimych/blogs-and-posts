import {ObjectId} from "mongodb";
import {PostDocument, PostModel} from "../../routes/posts/post.entity";

export class PostsRepository {
    async findPostById(postId: string): Promise<PostDocument | null> {
        return PostModel.findOne({ _id: new ObjectId(postId) })
    }

    async save(post: PostDocument): Promise<string> {
        const savedPost = await post.save();
        return savedPost._id.toString()
    }

    async deletePost(id: string): Promise<boolean> {
        const post = await PostModel.findByIdAndDelete(id);
        return !!post;
    }
}