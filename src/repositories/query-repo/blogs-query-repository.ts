import {PaginationModel} from "../../types/PaginationModel";
import {BlogViewModel} from "../../types/blogs-types/BlogViewModel";
import {ObjectId, WithId} from "mongodb";
import {BlogDbModel} from "../../types/blogs-types/BlogDbModel";
import {blogsCollection} from "../db";
import {blogMapper} from "../../utils/mappers";
import {PaginationType} from "../../routes/helpers/pagination-helper";

export const blogsQueryRepository = {
    async getAllBlogs(options: PaginationType): Promise<PaginationModel<BlogViewModel[]>> {
        const filter = options.searchNameTerm
            ? {name: {$regex: options.searchNameTerm, $options: 'i'}}
            : {}

        const sortDirection = options.sortDirection === 'asc' ? 1 : -1

        const items: WithId<BlogDbModel>[] = await blogsCollection
            .find(filter)
            .sort({[options.sortBy]: sortDirection })
            .skip((options.pageNumber - 1) * options.pageSize)
            .limit(options.pageSize)
            .toArray()

        const totalCount = await blogsCollection.countDocuments(filter);

        return {
            pagesCount: Math.ceil(totalCount / options.pageSize),
            page: options.pageNumber,
            pageSize: options.pageSize,
            totalCount: totalCount,
            items: items.map(blogMapper)
        }
    },

    async findBlogById(id: string): Promise<BlogViewModel | null> {
        const blog: WithId<BlogDbModel> | null = await blogsCollection.findOne({ _id: new ObjectId(id) });

        if (blog) {
            return blogMapper(blog);
        } else {
            return null;
        }
    },
}