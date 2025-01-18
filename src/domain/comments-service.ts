import {commentsRepository} from "../repositories/db-repo/comments-db-repository";
import {responseFactory, Result} from "../utils/object-result";
import {postsRepository} from "../repositories/db-repo/posts-db-repository";
import {usersRepository} from "../repositories/db-repo/users-db-repository";
import {CommentModel} from "../routes/comments/comment.entity";

class CommentsService {
    async checkComment(commentId: string): Promise<Result<null>> {
        const comment = await commentsRepository.findCommentById(commentId);

        if (!comment) {
            return responseFactory.notFound();
        }
        return responseFactory.success(null);
    }

    async createComment(postId: string, content: string, userId: string): Promise<Result<null> | Result<string>> {
        const post = await postsRepository.findPostById(postId);

        if (!post) {
            return responseFactory.notFound();
        }

        const user = await usersRepository.findUserById(userId);

        const newComment = {
            postId,
            content,
            commentatorInfo: {
                userId: user._id.toString(),
                userLogin: user.accountData.login
            }
        }

        const comment = new CommentModel(newComment);
        const commentId = await commentsRepository.save(comment);

        return responseFactory.success(commentId);
    }

    async updateComment(userId: string, commentId: string, content: string): Promise<Result<null>> {
        const comment = await commentsRepository.findCommentById(commentId);

        if (!comment) {
            return responseFactory.notFound()
        }

        if (comment.commentatorInfo.userId !== userId) {
            return responseFactory.forbidden()
        }

        comment.content = content;

        await commentsRepository.save(comment);

        return responseFactory.success(null);
    }

    async deleteComment(userId: string, commentId: string): Promise<Result<null>> {
        const comment = await commentsRepository.findCommentById(commentId);

        if (!comment) {
            return responseFactory.notFound()
        }

        if (comment.commentatorInfo.userId !== userId) {
            return responseFactory.forbidden()
        }

        await comment.deleteOne();

        return responseFactory.success(null);
    }
}

export const commentsService = new CommentsService()