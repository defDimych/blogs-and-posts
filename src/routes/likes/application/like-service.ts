import {UpdateCommentLikeStatusDto} from "./dto/UpdateCommentLikeStatusDto";
import {CommentsService} from "../../../domain/comments-service";
import {DomainStatusCode, responseFactory} from "../../../utils/object-result";
import {LikeRepository} from "../infrastructure/like-db-repository";
import {CreateCommentLikeDto} from "./dto/CreateCommentLikeDto";
import {CommentsRepository} from "../../../repositories/db-repo/comments-db-repository";
import {CommentLikeModel, Status} from "../domain/comment-like.entity";
import {inject, injectable} from "inversify";
import {UpdatePostLikeStatusDto} from "./dto/UpdatePostLikeStatusDto";
import {PostsRepository} from "../../../repositories/db-repo/posts-db-repository";
import {CreatePostLikeDto} from "./dto/CreatePostLikeDto";
import {PostLikeModel} from "../domain/post-like.entity";

@injectable()
export class LikeService {
    constructor(@inject(CommentsService) private commentsService: CommentsService,
                @inject(LikeRepository) private likeRepository: LikeRepository,
                @inject(CommentsRepository) private commentsRepository: CommentsRepository) {}

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

    async createLike(dto: CreateCommentLikeDto) {
        const createLike = {
            userId: dto.userId,
            commentId: dto.commentId,
            myStatus: dto.likeStatus
        }

        const like = new CommentLikeModel(createLike);

        await this.likeRepository.saveCommentLike(like)
        await this.calculateLikes(dto.likeStatus, "None", dto.commentId);
    }

    async updateLikeStatus(dto: UpdateCommentLikeStatusDto) {
        // todo переписать обращение к репозиторию, а не коммент сервису
        const result = await this.commentsService.checkComment(dto.commentId);

        if (result.status !== DomainStatusCode.Success) {
            return result
        }

        const like = await this.likeRepository.findLikeForComment(dto.userId, dto.commentId);

        if (!like) {
            await this.createLike(dto)
            return responseFactory.success(null)
        }

        if (like.myStatus === dto.likeStatus) {
            return responseFactory.success(null)
        }

        const currentStatus = like.myStatus
        like.myStatus = dto.likeStatus

        await this.likeRepository.saveCommentLike(like)
        await this.calculateLikes(dto.likeStatus, currentStatus, dto.commentId)

        return responseFactory.success(null)
    }
}

export class PostLikeService {
    constructor(@inject(PostsRepository) private postsRepository: PostsRepository,
                @inject(LikeRepository) private likeRepository: LikeRepository) {}

    async calculateLikes(likeStatus: string, currentStatus: string, postId: string) {
        const post = await this.postsRepository.findPostById(postId)
        if (!post) throw new Error('Post not found')

        if (currentStatus === Status.None && likeStatus === Status.Like) {
            post.likeCount++
        } else if (currentStatus === Status.None && likeStatus === Status.Dislike) {
            post.dislikeCount++
        } else if (currentStatus === Status.Like && likeStatus === Status.None) {
            post.likeCount--
        } else if (currentStatus === Status.Dislike && likeStatus === Status.None) {
            post.dislikeCount--
        } else if (currentStatus === Status.Like && likeStatus === Status.Dislike) {
            post.likeCount--
            post.dislikeCount++
        } else if (currentStatus === Status.Dislike && likeStatus === Status.Like) {
            post.dislikeCount--
            post.likeCount++
        }

        post.newestLikes = await this.likeRepository.getNewestLikes(postId)

        await this.postsRepository.save(post)
    }

    async createLike(dto: CreatePostLikeDto) {
        const createLike = {
            userId: dto.userId,
            postId: dto.postId,
            myStatus: dto.likeStatus
        }

        const like = new PostLikeModel(createLike);

        await this.likeRepository.savePostLike(like)
        await this.calculateLikes(dto.likeStatus, "None", dto.postId);

        return responseFactory.success(null)
    }

    async updateLikeStatus(dto: UpdatePostLikeStatusDto) {
        const post = await this.postsRepository.findPostById(dto.postId)

        if (!post) return responseFactory.notFound()

        const like = await this.likeRepository.findLikeForPost(dto.userId, dto.postId)

        if (!like) return this.createLike(dto)

        if (like.myStatus === dto.likeStatus) {
            return responseFactory.success(null)
        }

        const currentStatus = like.myStatus
        like.myStatus = dto.likeStatus

        await this.likeRepository.savePostLike(like)
        await this.calculateLikes(dto.likeStatus, currentStatus, dto.postId)

        return responseFactory.success(null)
    }
}