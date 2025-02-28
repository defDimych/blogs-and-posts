import {ObjectId, WithId} from "mongodb";
import {PaginationType} from "../../routes/helpers/pagination-helper";
import {CommentDbModel} from "../../types/comments-type/CommentDbModel";
import {PaginationModel} from "../../types/PaginationModel";
import {CommentViewModel} from "../../types/comments-type/CommentViewModel";
import {CommentModel} from "../../routes/comments/domain/comment.entity";
import {CommentLikeDbType, CommentLikeModel, Status} from "../../routes/likes/domain/comment-like.entity";
import {injectable} from "inversify";

@injectable()
export class CommentsQueryRepository {
    async getAllComments(options: PaginationType, postId: string, userId: string): Promise<PaginationModel<CommentViewModel[]>> {
        const filter = userId
            ? { postId, "commentatorInfo.userId": userId }
            : { postId }

        const sortDirection = options.sortDirection === 'asc' ? 1 : -1

        try {
            const commentsPromise = CommentModel
                .find(filter)
                .sort({[options.sortBy]: sortDirection})
                .skip((options.pageNumber - 1) * options.pageSize)
                .limit(options.pageSize)
                .lean()

            const totalCountPromise = CommentModel.countDocuments(filter);
            const [comments, totalCount] = await Promise.all([commentsPromise, totalCountPromise]);

            const ids = comments.map(comment => comment._id.toString())
            const likes = await CommentLikeModel.find({ commentId: {$in: ids}, userId }).lean()

            const dictionaryLikes = likes.reduce((dict, like) => {
                dict.set(like.commentId, like.myStatus)
                return dict
            }, new Map())

            const viewItems = comments.map(comment => {
                const status: Status | undefined = dictionaryLikes.get(comment._id.toString())

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
                        myStatus: (!userId || !status) ? Status.None : status
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
            console.log(`Comment query repository, getAllComments : ${JSON.stringify(e, null, 2)}`)
            throw new Error(`some error`)
        }
    }

    async findCommentById(commentId: string): Promise<WithId<CommentDbModel>> {
        const comment = await CommentModel.findOne({ _id: new ObjectId(commentId) }).lean();
        if (!comment) throw new Error(`comment by id: ${commentId} not found`)

        return comment
    }

    async findLike(commentId: string, userId: string): Promise<WithId<CommentLikeDbType>> {
        const like = await CommentLikeModel.findOne({commentId, userId}).lean()
        if (!like) throw new Error('like not found')

        return like
    }

    async getComment(commentId: string, userId: string): Promise<CommentViewModel> {
        const comment = await this.findCommentById(commentId);

        const like = await CommentLikeModel.findOne({ commentId: comment._id.toString(), userId });

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
                myStatus: (!userId || !like) ? Status.None : like.myStatus
            }
        }
    }
}