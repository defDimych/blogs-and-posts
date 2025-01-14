import {PaginationModel} from "../../types/PaginationModel";
import {PostViewModel} from "../../types/posts-types/PostViewModel";
import {ObjectId, WithId} from "mongodb";
import {PostDbModel} from "../../types/posts-types/PostDbModel";
import {postMapper} from "../../utils/mappers";
import {PaginationType} from "../../routes/helpers/pagination-helper";
import {PostModel} from "../../routes/posts/post.entity";

export const postsQueryRepository = {
    async getAllPostsByBlogId(options: PaginationType, blogId: string): Promise<PaginationModel<PostViewModel[]>> {
        const sortDirection = options.sortDirection === 'asc' ? 1 : -1

        try {
            const items: WithId<PostDbModel>[] = await PostModel
                .find({blogId})
                .sort({[options.sortBy]: sortDirection})
                .skip((options.pageNumber - 1) * options.pageSize)
                .limit(options.pageSize)
                .lean()

            const totalCount = await PostModel.countDocuments({blogId});

            return {
                pagesCount: Math.ceil(totalCount / options.pageSize),
                page: options.pageNumber,
                pageSize: options.pageSize,
                totalCount: totalCount,
                items: items.map(postMapper)
            }
        } catch (e) {
            console.log(`POST db repository, getAllPosts : ${JSON.stringify(e, null, 2)}`)
            throw new Error(`some error`)
        }
    },

    async getAllPosts(options: PaginationType): Promise<PaginationModel<PostViewModel[]>> {
        const sortDirection = options.sortDirection === 'asc' ? 1 : -1

        try {
            const items: WithId<PostDbModel>[] = await PostModel
                .find({})
                .sort({[options.sortBy]: sortDirection})
                .skip((options.pageNumber - 1) * options.pageSize)
                .limit(options.pageSize)
                .lean()

            const totalCount = await PostModel.countDocuments({});

            return {
                pagesCount: Math.ceil(totalCount / options.pageSize),
                page: options.pageNumber,
                pageSize: options.pageSize,
                totalCount: totalCount,
                items: items.map(postMapper)
            }
        } catch (e) {
            console.log(`POST db repository, getAllPosts : ${JSON.stringify(e, null, 2)}`)
            throw new Error(`some error`)
        }
    },

    async findPostById(id: string): Promise<PostViewModel | null> {
        const post: WithId<PostDbModel> | null = await PostModel.findOne({ _id: new ObjectId(id) });

        if (post) {
            return postMapper(post);
        } else {
            return null;
        }
    },
}