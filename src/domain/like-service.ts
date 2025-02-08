import {UpdateLikeStatusDto} from "../routes/comments/UpdateLikeStatusDto";
import {CommentsService} from "./comments-service";
import {DomainStatusCode, responseFactory} from "../utils/object-result";
import {LikeRepository} from "../repositories/db-repo/like-db-repository";
import {CreateLikeDto} from "../routes/comments/CreateLikeDto";
import {CommentsRepository} from "../repositories/db-repo/comments-db-repository";
import {LikeModel, Status} from "../routes/comments/like.entity";

export class LikeService {
    constructor(private commentsService: CommentsService,
                private likeRepository: LikeRepository,
                private commentsRepository: CommentsRepository) {}

    async calculateLikes(likeStatus: string, currentStatus: string, commentId: string) {
        const comment = await this.commentsRepository.findCommentById(commentId)
        if (!comment) throw new Error('Comment not found')

        if (currentStatus === Status.None && likeStatus === Status.Like) {
            comment.likeCount++
        } else if (currentStatus === Status.None && likeStatus === Status.Dislike) {
            comment.dislikeCount++
        } else if (currentStatus === Status.Like && likeStatus === Status.None) {
            comment.likeCount--
        } else if (currentStatus === Status.Dislike && likeStatus === Status.None) {
            comment.dislikeCount--
        } else if (currentStatus === Status.Like && likeStatus === Status.Dislike) {
            comment.likeCount--
            comment.dislikeCount++
        } else if (currentStatus === Status.Dislike && likeStatus === Status.Like) {
            comment.dislikeCount--
            comment.likeCount++
        }

        await this.commentsRepository.save(comment)
    }

    async createLike(dto: CreateLikeDto) {
        const createLike = {
            userId: dto.userId,
            commentId: dto.commentId,
            myStatus: dto.likeStatus
        }

        const like = new LikeModel(createLike);

        await this.likeRepository.save(like)
        await this.calculateLikes(dto.likeStatus, "None", dto.commentId);
    }

    async updateLikeStatus(dto: UpdateLikeStatusDto) {
        const result = await this.commentsService.checkComment(dto.commentId);

        if (result.status !== DomainStatusCode.Success) {
            return result
        }

        const like = await this.likeRepository.findLike(dto.userId, dto.commentId);

        if (!like) {
            await this.createLike(dto)
            return responseFactory.success(null)
        }

        if (like.myStatus === dto.likeStatus) {
            return responseFactory.success(null)
        }

        const currentStatus = like.myStatus
        like.myStatus = dto.likeStatus

        await this.likeRepository.save(like)
        await this.calculateLikes(dto.likeStatus, currentStatus, dto.commentId)

        return responseFactory.success(null)
    }
}