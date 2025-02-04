import {PostsService} from "../../domain/posts-service";
import {PostsQueryRepository} from "../../repositories/query-repo/posts-query-repository";
import {CommentsQueryRepository} from "../../repositories/query-repo/comments-query-repository";
import {CommentsService} from "../../domain/comments-service";
import {
    RequestWithBody,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery,
    RequestWithQuery
} from "../../types/request-types";
import {PaginationQueryType} from "../../types/PaginationQueryType";
import {Request, Response} from "express";
import {getDefaultPaginationOptions} from "../helpers/pagination-helper";
import {HTTP_STATUSES} from "../../utils/http-statuses";
import {DomainStatusCode, handleError} from "../../utils/object-result";
import {PostInputModel} from "../../types/posts-types/PostInputModel";
import {CommentInputModel} from "../../types/comments-type/CommentInputModel";

export class PostsController {
    constructor(private postsService: PostsService,
                private postsQueryRepository: PostsQueryRepository,
                private commentsQueryRepository: CommentsQueryRepository,
                private commentsService: CommentsService) {}

    async getPosts(req: RequestWithQuery<PaginationQueryType>, res: Response){
        const sorting: PaginationQueryType = req.query
        const receivedPosts = await this.postsQueryRepository.getAllPosts(getDefaultPaginationOptions(sorting))

        res.status(HTTP_STATUSES.SUCCESS_200).send(receivedPosts);
    }

    async getPost(req: Request, res: Response){
        const foundPost = await this.postsQueryRepository.findPostById(req.params.id);

        if (!foundPost) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return
        }
        res.status(HTTP_STATUSES.SUCCESS_200).send(foundPost);
    }

    async getCommentsSpecificPost(req: RequestWithParamsAndQuery<{postId: string}, PaginationQueryType>, res: Response){
        const result = await this.postsService.checkPost(req.params.postId);

        if (result.status !== DomainStatusCode.Success) {
            res.sendStatus(handleError(result.status));
            return
        }

        const receivedComments =
            await this.commentsQueryRepository.getAllComments(getDefaultPaginationOptions(req.query), req.params.postId, req.userId);

        res.status(HTTP_STATUSES.SUCCESS_200).send(receivedComments);
    }

    async createPost(req: RequestWithBody<PostInputModel>, res: Response){
        const createdPostId = await this.postsService.createPost(req.body);
        const createdPost = await this.postsQueryRepository.findPostById(createdPostId)

        if (!createdPost) return;

        res.status(HTTP_STATUSES.CREATED_201).send(createdPost);
    }

    async createCommentForPost(req: RequestWithParamsAndBody<{ postId: string }, CommentInputModel>, res: Response){
        const result = await this.commentsService.createComment(req.params.postId, req.body.content, req.userId!);

        if (result.status !== DomainStatusCode.Success) {
            res.sendStatus(handleError(result.status));
            return
        }
        const createdComment = await this.commentsQueryRepository.getComment(result.data!, req.userId);

        res.status(HTTP_STATUSES.CREATED_201).send(createdComment);
    }

    async updatePost(req: RequestWithParamsAndBody<{ id: string }, PostInputModel>, res: Response){
        const isUpdated = await this.postsService.updatePost(req.params.id, req.body);

        if (isUpdated) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
            return
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }
    }

    async deletePost(req: Request, res: Response){
        const isDeleted = await this.postsService.deletePost(req.params.id);

        if (isDeleted) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }
    }
}