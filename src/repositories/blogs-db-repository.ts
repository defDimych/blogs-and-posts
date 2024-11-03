import {ExtendedBlogViewModel} from "../types/blogs-types/BlogViewModel";
import {BlogInputModel} from "../types/blogs-types/BlogInputModel";
import {blogsCollection} from "./db";
import {BlogDbModel} from "../types/blogs-types/BlogDbModel";
import {ObjectId, SortDirection, WithId} from "mongodb";
import {TPaginationOptions} from "../types/TPaginationOptions";
import {PaginationModel} from "../types/PaginationModel";

const blogMapper = (blog: WithId<BlogDbModel>): ExtendedBlogViewModel => {
    return {
        id: blog._id.toString(),
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership
    }
}


export const blogsRepository = {
    async getAllBlogs({ searchNameTerm, sortBy, sortDirection, pageNumber, pageSize }: TPaginationOptions): Promise<PaginationModel<ExtendedBlogViewModel[]> | {error: string}> {
        const options = {
            searchNameTerm: searchNameTerm ? searchNameTerm : null,
            sortBy: sortBy ? sortBy : 'createdAt',
            sortDirection: sortDirection ? sortDirection : 'desc',
            pageNumber: pageNumber ? +pageNumber : 1,
            pageSize: pageSize ? +pageSize : 10
        } as TPaginationOptions

        const _sortDirection = options.sortDirection === 'asc' ? 1 : -1

        const filter = options.searchNameTerm
            ? {name: {$regex: options.searchNameTerm, $options: 'i'}}
            : {}

        try {
            const items = await blogsCollection
                .find(filter)
                .sort({[options.sortBy]: _sortDirection})
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
        } catch(err) {
            console.log(err);
            return {error: 'some error'}
        }

    },

    async createBlog(newBlog: BlogDbModel): Promise<ExtendedBlogViewModel | null> {
        const result = await blogsCollection.insertOne(newBlog);
        const blogId = result.insertedId.toString();

        const createdBlog = blogsRepository.findBlogById(blogId);

        if(createdBlog) {
            return createdBlog;
        } else {
            throw new Error(`при создани блога с данными ${newBlog}, он почему то не вернулся`)
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

    async updateBlog(id: string, {name, description, websiteUrl}: BlogInputModel): Promise<boolean> {
        const result = await blogsCollection.updateOne(
            { _id: new ObjectId(id) }, { $set: { name, description, websiteUrl } }
        )

        return result.modifiedCount === 1;
    },

    async deleteBlog(id: string): Promise<boolean> {
        const result = await blogsCollection.deleteOne({ _id: new ObjectId(id) });

        return result.deletedCount === 1;
    }
 }