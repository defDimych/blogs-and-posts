import {commentsRepository} from "../repositories/db-repo/comments-db-repository";
import {responseFactory} from "../utils/object-result";
import {postsRepository} from "../repositories/db-repo/posts-db-repository";
import {usersRepository} from "../repositories/db-repo/users-db-repository";

export const commentsService = {
    async checkComment(commentId: string) {
        const foundComment = await commentsRepository.findCommentById(commentId);

        if (!foundComment) {
            return responseFactory.notFound();
        }
        return responseFactory.success(null);
    },

    async createComment(postId: string, content: string, userId: string) {
        const isFound = await postsRepository.findPostById(postId);

        if (!isFound) {
            return responseFactory.notFound();
        }

        const user = await usersRepository.findUserById(userId);

        const newComment = {
            postId,
            content,
            commentatorInfo: {
                userId: user._id.toString(),
                userLogin: user.accountData.login
            },
            createdAt: new Date().toISOString()
        }
        const savedCommentId = await commentsRepository.saveComment(newComment);

        return responseFactory.success(savedCommentId);
    },

    async updateComment(userId: string, commentId: string, content: string) {
        const foundComment = await commentsRepository.findCommentById(commentId);

        if (!foundComment) {
            return responseFactory.notFound()
        }

        if (foundComment.commentatorInfo.userId !== userId) {
            return responseFactory.forbidden()
        }

        const isUpdated = await commentsRepository.updateComment(commentId, content);

        if (!isUpdated) {
            throw new Error(`Failed to update comment by id: ${commentId}`);
        }

        return responseFactory.success(null);
    },

    async deleteComment(userId: string, commentId: string) {
        const foundComment = await commentsRepository.findCommentById(commentId);

        if (!foundComment) {
            return responseFactory.notFound()
        }

        if (foundComment.commentatorInfo.userId !== userId) {
            return responseFactory.forbidden()
        }

        const isDeleted = await commentsRepository.deleteComment(commentId);

        if (!isDeleted) {
            throw new Error(`Failed to delete comment by id: ${commentId}`);
        }

        return responseFactory.success(null);
    }
}