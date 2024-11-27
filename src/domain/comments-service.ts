import {commentsRepository} from "../repositories/db-repo/comments-db-repository";
import {domainStatusResponse} from "../utils/object-result";
import {postsRepository} from "../repositories/db-repo/posts-db-repository";
import {usersDbRepository} from "../repositories/db-repo/users-db-repository";

export const commentsService = {
    async checkComment(commentId: string) {
        const foundComment = await commentsRepository.findCommentById(commentId);

        if (!foundComment) {
            return domainStatusResponse.notFound();
        }
        return domainStatusResponse.success(null);
    },

    async createComment(postId: string, content: string, userId: string) {
        const isFound = await postsRepository.findPostById(postId);

        if (!isFound) {
            return domainStatusResponse.notFound();
        }

        const user = await usersDbRepository.findUserById(userId);

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

        return domainStatusResponse.success(savedCommentId);
    },

    async updateComment(userId: string, commentId: string, content: string) {
        const foundComment = await commentsRepository.findCommentById(commentId);

        if (!foundComment) {
            return domainStatusResponse.notFound()
        }

        if (foundComment.commentatorInfo.userId !== userId) {
            return domainStatusResponse.forbidden()
        }

        const isUpdated = await commentsRepository.updateComment(commentId, content);

        if (!isUpdated) {
            throw new Error(`Failed to update comment by id: ${commentId}`);
        }

        return domainStatusResponse.success(null);
    },

    async deleteComment(userId: string, commentId: string) {
        const foundComment = await commentsRepository.findCommentById(commentId);

        if (!foundComment) {
            return domainStatusResponse.notFound()
        }

        if (foundComment.commentatorInfo.userId !== userId) {
            return domainStatusResponse.forbidden()
        }

        const isDeleted = await commentsRepository.deleteComment(commentId);

        if (!isDeleted) {
            throw new Error(`Failed to delete comment by id: ${commentId}`);
        }

        return domainStatusResponse.success(null);
    }
}