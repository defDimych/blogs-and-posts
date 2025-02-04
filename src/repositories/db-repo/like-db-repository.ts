import {LikeDocument, LikeModel} from "../../routes/comments/like.entity";

export class LikeRepository {
    async findLike(userId: string, commentId: string): Promise<LikeDocument | null> {
        return LikeModel.findOne({ userId, commentId })
    }

    async save(like: LikeDocument) {
        await like.save()
    }
}