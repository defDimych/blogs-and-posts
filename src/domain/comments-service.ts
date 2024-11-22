import {commentsRepository} from "../repositories/db-repo/comments-db-repository";
import {objectResult} from "../utils/object-result";
import {postsRepository} from "../repositories/db-repo/posts-db-repository";
import {usersDbRepository} from "../repositories/db-repo/users-db-repository";

export const commentsService = {
    async checkComment(commentId: string) {
        const foundComment = await commentsRepository.findCommentById(commentId);

        if (!foundComment) {
            return objectResult.notFound();
        }
        return objectResult.success(null);
    },

    async createComment(postId: string, content: string, userId: string) {
        const isFound = await postsRepository.findPostById(postId);

        if (!isFound) {
            return objectResult.notFound();
        }

        const user = await usersDbRepository.findUserById(userId);

        const newComment = {
            postId,
            content,
            commentatorInfo: {
                userId: user._id.toString(),
                userLogin: user.login
            },
            createdAt: new Date().toISOString()
        }
        const savedCommentId = await commentsRepository.saveComment(newComment);

        return objectResult.success(savedCommentId);
    },

    async updateComment(userId: string, commentId: string, content: string) {
        const foundComment = await commentsRepository.findCommentById(commentId);

        if (!foundComment) {
            return objectResult.notFound()
        }

        if (foundComment.commentatorInfo.userId !== userId) {
            return objectResult.forbidden()
        }

        const isUpdated = await commentsRepository.updateComment(commentId, content);

        if (!isUpdated) {
            throw new Error(`Failed to update comment by id: ${commentId}`);
        }

        return objectResult.success(null);
    },

    async deleteComment(userId: string, commentId: string) {
        const foundComment = await commentsRepository.findCommentById(commentId);

        if (!foundComment) {
            return objectResult.notFound()
        }

        if (foundComment.commentatorInfo.userId !== userId) {
            return objectResult.forbidden()
        }

        const isDeleted = await commentsRepository.deleteComment(commentId);

        if (!isDeleted) {
            throw new Error(`Failed to delete comment by id: ${commentId}`);
        }

        return objectResult.success(null);
    }
}