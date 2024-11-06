import {PaginationQueryType} from "../../types/PaginationQueryType";
import {PaginationModel} from "../../types/PaginationModel";
import {ExtendedPostViewModel} from "../../types/posts-types/PostViewModel";
import {ObjectId, WithId} from "mongodb";
import {PostDbModel} from "../../types/posts-types/PostDbModel";
import {postsCollection} from "../db";
import {postMapper} from "../../utils/blogs-and-posts-mapper";

export const postsQueryRepository = {
    async getAllPostsByBlogId(options: PaginationQueryType, blogId: string): Promise<PaginationModel<ExtendedPostViewModel[]>> {
        const sortDirection = options.sortDirection === 'asc' ? 1 : -1

        try {
            const items: WithId<PostDbModel>[] = await postsCollection
                .find({blogId})
                .sort({[options.sortBy]: sortDirection})
                .skip((+options.pageNumber - 1) * +options.pageSize)
                .limit(+options.pageSize)
                .toArray()

            const totalCount = await postsCollection.countDocuments({blogId});

            return {
                pagesCount: Math.ceil(totalCount / +options.pageSize),
                page: +options.pageNumber,
                pageSize: +options.pageSize,
                totalCount: totalCount,
                items: items.map(postMapper)
            }
        } catch (e) {
            console.log(`POST db repository, getAllPosts : ${JSON.stringify(e, null, 2)}`)
            throw new Error(`some error`)
        }
    },

    async getAllPosts(options: PaginationQueryType): Promise<PaginationModel<ExtendedPostViewModel[]>> {
        const sortDirection = options.sortDirection === 'asc' ? 1 : -1

        try {
            const items: WithId<PostDbModel>[] = await postsCollection
                .find({})
                .sort({[options.sortBy]: sortDirection})
                .skip((+options.pageNumber - 1) * +options.pageSize)
                .limit(+options.pageSize)
                .toArray()

            const totalCount = await postsCollection.countDocuments({});

            return {
                pagesCount: Math.ceil(totalCount / +options.pageSize),
                page: +options.pageNumber,
                pageSize: +options.pageSize,
                totalCount: totalCount,
                items: items.map(postMapper)
            }
        } catch (e) {
            console.log(`POST db repository, getAllPosts : ${JSON.stringify(e, null, 2)}`)
            throw new Error(`some error`)
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
}