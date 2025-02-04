import {ObjectId, WithId} from "mongodb";
import {PaginationType} from "../../routes/helpers/pagination-helper";
import {CommentDbModel} from "../../types/comments-type/CommentDbModel";
import {PaginationModel} from "../../types/PaginationModel";
import {CommentViewModel} from "../../types/comments-type/CommentViewModel";
import {CommentModel} from "../../routes/comments/comment.entity";
import {LikeDB, LikeModel, Status} from "../../routes/comments/like.entity";

export class CommentsQueryRepository {
    async getAllComments(options: PaginationType, postId: string, userId: string): Promise<PaginationModel<CommentViewModel[]>> {
        const filter = userId
            ? { postId, "commentatorInfo.userId": userId }
            : { postId }

        const sortDirection = options.sortDirection === 'asc' ? 1 : -1

        try {
            const items: WithId<CommentDbModel>[] = await CommentModel
                .find(filter)
                .sort({[options.sortBy]: sortDirection})
                .skip((options.pageNumber - 1) * options.pageSize)
                .limit(options.pageSize)
                .lean()

            const totalCount = await CommentModel.countDocuments(filter);

            return {
                pagesCount: Math.ceil(totalCount / options.pageSize),
                page: options.pageNumber,
                pageSize: options.pageSize,
                totalCount: totalCount,
                items: await Promise.all(items.map(async (comment) => {
                    const like = await LikeModel.findOne({ commentId: comment._id.toString(), userId });

                    if (!userId || !like) {
                        return {
                            id: comment._id.toString(),
                            commentatorInfo: {
                                userId: comment.commentatorInfo.userId,
                                userLogin: comment.commentatorInfo.userLogin
                            },
                            content: comment.content,
                            createdAt: comment.createdAt.toISOString(),
                            likesInfo: {
                                likesCount: comment.likeCount,
                                dislikesCount: comment.dislikeCount,
                                myStatus: Status.None
                            }
                        }
                    }

                    return {
                        id: comment._id.toString(),
                        commentatorInfo: {
                            userId: comment.commentatorInfo.userId,
                            userLogin: comment.commentatorInfo.userLogin
                        },
                        content: comment.content,
                        createdAt: comment.createdAt.toISOString(),
                        likesInfo: {
                            likesCount: comment.likeCount,
                            dislikesCount: comment.dislikeCount,
                            myStatus: like.myStatus
                        }
                    }
                }))
            }
        } catch (e) {
            console.log(`Comment query repository, getAllComments : ${JSON.stringify(e, null, 2)}`)
            throw new Error(`some error`)
        }
    }

    async findCommentById(commentId: string): Promise<WithId<CommentDbModel>> {
        const comment = await CommentModel.findOne({ _id: new ObjectId(commentId) }).lean();
        if (!comment) throw new Error(`comment by id: ${commentId} not found`)

        return comment
    }

    async findLike(commentId: string, userId: string): Promise<WithId<LikeDB>> {
        const like = await LikeModel.findOne({commentId, userId}).lean()
        if (!like) throw new Error('like not found')

        return like
    }

    async getComment(commentId: string, userId: string): Promise<CommentViewModel> {
        const comment = await this.findCommentById(commentId);

        const like = await LikeModel.findOne({ commentId: comment._id.toString(), userId });

        if (!userId || !like) {
            return {
                id: comment._id.toString(),
                commentatorInfo: {
                    userId: comment.commentatorInfo.userId,
                    userLogin: comment.commentatorInfo.userLogin
                },
                content: comment.content,
                createdAt: comment.createdAt.toISOString(),
                likesInfo: {
                    likesCount: comment.likeCount,
                    dislikesCount: comment.dislikeCount,
                    myStatus: Status.None
                }
            }
        }

        return {
            id: comment._id.toString(),
            commentatorInfo: {
                userId: comment.commentatorInfo.userId,
                userLogin: comment.commentatorInfo.userLogin
            },
            content: comment.content,
            createdAt: comment.createdAt.toISOString(),
            likesInfo: {
                likesCount: comment.likeCount,
                dislikesCount: comment.dislikeCount,
                myStatus: like.myStatus
            }
        }
    }
}