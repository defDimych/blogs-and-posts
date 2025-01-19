import {ObjectId, WithId} from "mongodb";
import {commentMapper} from "../../utils/mappers";
import {PaginationType} from "../../routes/helpers/pagination-helper";
import {CommentDbModel} from "../../types/comments-type/CommentDbModel";
import {PaginationModel} from "../../types/PaginationModel";
import {CommentViewModel} from "../../types/comments-type/CommentViewModel";
import {CommentModel} from "../../routes/comments/comment.entity";

export class CommentsQueryRepository {
    async getAllComments(options: PaginationType, postId: string): Promise<PaginationModel<CommentViewModel[]>> {
        const sortDirection = options.sortDirection === 'asc' ? 1 : -1

        try {
            const items: WithId<CommentDbModel>[] = await CommentModel
                .find({postId})
                .sort({[options.sortBy]: sortDirection})
                .skip((options.pageNumber - 1) * options.pageSize)
                .limit(options.pageSize)
                .lean()

            const totalCount = await CommentModel.countDocuments({postId});

            return {
                pagesCount: Math.ceil(totalCount / options.pageSize),
                page: options.pageNumber,
                pageSize: options.pageSize,
                totalCount: totalCount,
                items: items.map(commentMapper)
            }
        } catch (e) {
            console.log(`Comment query repository, getAllComments : ${JSON.stringify(e, null, 2)}`)
            throw new Error(`some error`)
        }
    }

    async findCommentById(id: string): Promise<CommentViewModel> {
        const comment = await CommentModel.findOne({ _id: new ObjectId(id) }).lean();

        if (!comment) {
            throw new Error(`comment by id: ${id} not found`)
        }

        return commentMapper(comment);
    }
}