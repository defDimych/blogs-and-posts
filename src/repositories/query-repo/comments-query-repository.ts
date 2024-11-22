import {commentsCollection} from "../db";
import {ObjectId, WithId} from "mongodb";
import {commentMapper} from "../../utils/mappers";
import {PaginationType} from "../../routes/helpers/pagination-helper";
import {CommentDbModel} from "../../types/comments-type/CommentDbModel";
import {PaginationModel} from "../../types/PaginationModel";
import {CommentViewModel} from "../../types/comments-type/CommentViewModel";

export const commentsQueryRepository = {
    async getAllComments(options: PaginationType, postId: string): Promise<PaginationModel<CommentViewModel[]>> {
        const sortDirection = options.sortDirection === 'asc' ? 1 : -1

        try {
            const items: WithId<CommentDbModel>[] = await commentsCollection
                .find({postId})
                .sort({[options.sortBy]: sortDirection})
                .skip((options.pageNumber - 1) * options.pageSize)
                .limit(options.pageSize)
                .toArray()

            const totalCount = await commentsCollection.countDocuments({postId});

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
    },

    async findCommentById(id: string) {
        const foundComment = await commentsCollection.findOne({ _id: new ObjectId(id) });

        if (!foundComment) {
            throw new Error(`comment by id: ${id} not found`)
        }

        return commentMapper(foundComment);
    }
}