import {PaginationModel} from "../../types/PaginationModel";
import {PostViewModel} from "../../types/posts-types/PostViewModel";
import {ObjectId, WithId} from "mongodb";
import {PostDbModel} from "../../types/posts-types/PostDbModel";
import {PaginationType} from "../../routes/helpers/pagination-helper";
import {PostModel} from "../../routes/posts/domain/post.entity";
import {injectable} from "inversify";
import {Status} from "../../routes/likes/domain/comment-like.entity";
import {PostLikeModel} from "../../routes/likes/domain/post-like.entity";

@injectable()
export class PostsQueryRepository {
    async getAllPosts(options: PaginationType, userId: string | undefined, blogId?: string): Promise<PaginationModel<PostViewModel[]>> {
        const filter = blogId ? { blogId } : {}

        const sortDirection = options.sortDirection === 'asc' ? 1 : -1

        try {
            const posts: WithId<PostDbModel>[] = await PostModel
                .find(filter)
                .sort({[options.sortBy]: sortDirection})
                .skip((options.pageNumber - 1) * options.pageSize)
                .limit(options.pageSize)
                .lean()

            const totalCount = await PostModel.countDocuments(filter);

            const ids = posts.map(p => p._id.toString())
            const userLikes = userId ? await PostLikeModel.find({ postId: {$in: ids}, userId }).lean() : []

            const dictionaryLikes = userLikes.reduce((dict, like) => {
                dict.set(like.postId, like.myStatus)
                return dict
            }, new Map())

            const viewItems = posts.map(post => {
                const status: Status | undefined = dictionaryLikes.get(post._id.toString())

                return {
                    id: post._id.toString(),
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: post.blogId,
                    blogName: post.blogName,
                    createdAt: post.createdAt.toISOString(),
                    extendedLikesInfo: {
                        likesCount: post.likeCount,
                        dislikesCount: post.dislikeCount,
                        myStatus: status ?? Status.None,
                        newestLikes: post.newestLikes.map(like => {
                            return {
                                addedAt: like.createdAt.toISOString(),
                                userId: like.userId,
                                login: like.login
                            }
                        })
                    }
                }
            })

            return {
                pagesCount: Math.ceil(totalCount / options.pageSize),
                page: options.pageNumber,
                pageSize: options.pageSize,
                totalCount: totalCount,
                items: viewItems
            }
        } catch (e) {
            console.log(`POST db repository, getAllPosts : ${JSON.stringify(e, null, 2)}`)
            throw new Error(`some error`)
        }
    }

    async findPostById(postId: string, userId?: string): Promise<PostViewModel | null> {
        const post: WithId<PostDbModel> | null = await PostModel.findOne({_id: new ObjectId(postId)});
        if (!post) return null

        const userLike = userId ? await PostLikeModel.findOne({ postId, userId }).lean() : null

        return {
            id: post._id.toString(),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt.toISOString(),
            extendedLikesInfo: {
                likesCount: post.likeCount,
                dislikesCount: post.dislikeCount,
                myStatus: userLike ? userLike.myStatus : Status.None,
                newestLikes: post.newestLikes.map(like => {
                    return {
                        addedAt: like.createdAt.toISOString(),
                        userId: like.userId,
                        login: like.login
                    }
                })
            }
        }
    }
}