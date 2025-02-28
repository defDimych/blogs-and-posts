import {CommentInputModel} from "../../src/types/comments-type/CommentInputModel";
import {blogsTestManager} from "./blogsTestManager";
import {postsTestManager} from "./postsTestManager";
import {req} from "./test-helpers";
import {SETTINGS} from "../../src/utils/settings";
import {HTTP_STATUSES} from "../../src/utils/http-statuses";
import {Status} from "../../src/routes/likes/domain/comment-like.entity";
import {CommentViewModel} from "../../src/types/comments-type/CommentViewModel";
import {userInfoDTO} from "../comment-api.e2e.test";

export const commentTestManager = {
    async createComment(data: CommentInputModel, userInfoDTO: userInfoDTO): Promise<CommentViewModel> {
        const newBlog = {
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://it-incubator.io/en'
        }

        const {createdBlog} = await blogsTestManager.createBlog(newBlog);

        const newPost = {
            title: 't1',
            shortDescription: 's1',
            content: 'c1',
            blogId: createdBlog.id
        }

        const {createdPost} = await postsTestManager.createPost(newPost);

        const response = await req
            .post(SETTINGS.PATH.POSTS + '/' + createdPost.id + '/comments')
            .set({"Authorization": "Bearer " + userInfoDTO.accessToken})
            .send(data)
            .expect(HTTP_STATUSES.CREATED_201)

        expect(response.body).toEqual({
            id: expect.any(String),
            commentatorInfo: {
                userId: userInfoDTO.userId,
                userLogin: userInfoDTO.userLogin
            },
            content: data.content,
            createdAt: expect.any(String),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: Status.None
            }
        })

        return response.body as CommentViewModel
    },

    async updateLikeStatus(commentId: string, access_token: string, likeStatus: string) {
        await req
            .put(SETTINGS.PATH.COMMENTS + '/' + commentId + '/like-status')
            .set({"Authorization": "Bearer " + access_token})
            .send({"likeStatus": likeStatus})
            .expect(HTTP_STATUSES.NO_CONTENT_204);
    },

    async getCommentById(commentId: string, access_token: string): Promise<CommentViewModel> {
        const res = await req
            .get(SETTINGS.PATH.COMMENTS + '/' + commentId)
            .set({"Authorization": "Bearer " + access_token})
            .expect(HTTP_STATUSES.SUCCESS_200)

        return res.body as CommentViewModel
    }
}