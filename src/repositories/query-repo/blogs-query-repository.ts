import {PaginationQueryType} from "../../types/PaginationQueryType";
import {PaginationModel} from "../../types/PaginationModel";
import {ExtendedBlogViewModel} from "../../types/blogs-types/BlogViewModel";
import {ObjectId, WithId} from "mongodb";
import {BlogDbModel} from "../../types/blogs-types/BlogDbModel";
import {blogsCollection} from "../db";
import {blogMapper} from "../../utils/blogs-and-posts-mapper";

export const blogsQueryRepository = {
    async getAllBlogs(options: PaginationQueryType): Promise<PaginationModel<ExtendedBlogViewModel[]>> {
        const filter = options.searchNameTerm
            ? {name: {$regex: options.searchNameTerm, $options: 'i'}}
            : {}

        const sortDirection = options.sortDirection === 'asc' ? 1 : -1

        const items: WithId<BlogDbModel>[] = await blogsCollection
            .find(filter)
            .sort({[options.sortBy]: sortDirection })
            .skip((+options.pageNumber - 1) * +options.pageSize)
            .limit(+options.pageSize)
            .toArray()

        const totalCount = await blogsCollection.countDocuments(filter);

        return {
            pagesCount: Math.ceil(totalCount / +options.pageSize),
            page: +options.pageNumber,
            pageSize: +options.pageSize,
            totalCount: totalCount,
            items: items.map(blogMapper)
        }
    },

    async findBlogById(id: string): Promise<ExtendedBlogViewModel | null> {
        const blog: WithId<BlogDbModel> | null = await blogsCollection.findOne({ _id: new ObjectId(id) });

        if (blog) {
            return blogMapper(blog);
        } else {
            return null;
        }
    },
}