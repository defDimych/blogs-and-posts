import {ObjectId} from "mongodb";
import {BlogDocument, BlogModel} from "../../routes/blogs/blog.entity";

class BlogsRepository {
    async findBlogById(id: string): Promise<BlogDocument | null> {
        return BlogModel.findOne({ _id: new ObjectId(id) });
    }

    async save(blog: BlogDocument): Promise<string> {
        const savedBlog = await blog.save();
        return savedBlog._id.toString()
    }

    async deleteBlog(id: string): Promise<boolean> {
        const blog = await BlogModel.findByIdAndDelete(id)
        return !!blog
    }
}

export const blogsRepository = new BlogsRepository();