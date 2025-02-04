import {MongoMemoryServer} from "mongodb-memory-server";
import {runDb} from "../src/db/run-db";
import {commentTestManager} from "./helpers/commentTestManager";
import {req} from "./helpers/test-helpers";
import {SETTINGS} from "../src/utils/settings";
import {CommentViewModel} from "../src/types/comments-type/CommentViewModel";
import {usersTestManager} from "./helpers/usersTestManager";
import {authTestManager} from "./helpers/authTestManager";
import {HTTP_STATUSES} from "../src/utils/http-statuses";
import {Status} from "../src/routes/comments/like.entity";

export type userInfoDTO = {
    accessToken: string;
    userId: string;
    userLogin: string;
}

describe('tests for /comments', () => {
    let server: MongoMemoryServer;

    beforeAll(async () => {
        server = await MongoMemoryServer.create();
        const uri = server.getUri();

        await runDb(uri);
    })

    beforeEach(async () => {})

    describe('tests for likes',() => {
        let createdComment: CommentViewModel
        let access_token_user1: string
        let access_token_user2: string

        it ('should create comment', async () => {
            const user = {
                email: 'example@example.com',
                login: 'backend777',
                password: '222222'
            }

            const {createdUser} = await usersTestManager.createUser(user)

            const loginData = {
                loginOrEmail: createdUser.login,
                password: '222222'
            }

            access_token_user1 = await authTestManager.login(loginData);

            const userInfoDTO = {
                accessToken: access_token_user1,
                userId: createdUser.id,
                userLogin: user.login
            }

            const newComment = {
                content: 'test test test test test'
            }

            createdComment = await commentTestManager.createComment(newComment, userInfoDTO)
        })

        it('like by user 1, then request comment by user 2', async () => {
            const user = {
                email: `example1@example.com`,
                login: `backend888`,
                password: '222222'
            }

            const {createdUser} = await usersTestManager.createUser(user)

            const loginData = {
                loginOrEmail: createdUser.login,
                password: '222222'
            }

            access_token_user2 = await authTestManager.login(loginData);

            await commentTestManager.updateLikeStatus(createdComment.id, access_token_user1, 'Like');

            const res1 = await commentTestManager.getCommentById(createdComment.id, access_token_user1)

            expect(res1.likesInfo).toEqual({
                likesCount: 1,
                dislikesCount: 0,
                myStatus: Status.Like
            })

            const res2 = await commentTestManager.getCommentById(createdComment.id, access_token_user2)

            expect(res2.likesInfo).toEqual({
                likesCount: 1,
                dislikesCount: 0,
                myStatus: Status.None
            })
        })

        it ('dislike by user 2, then request comment by user 1', async() => {
            await commentTestManager.updateLikeStatus(createdComment.id, access_token_user2, 'Dislike');

            const res1 = await commentTestManager.getCommentById(createdComment.id, access_token_user2)

            expect(res1.likesInfo).toEqual({
                likesCount: 1,
                dislikesCount: 1,
                myStatus: Status.Dislike
            })

            const res2 = await commentTestManager.getCommentById(createdComment.id, access_token_user1)

            expect(res2.likesInfo).toEqual({
                likesCount: 1,
                dislikesCount: 1,
                myStatus: Status.Like
            })
        })

        it ('set the status none by user 2, then request by user 1.', async () => {
            await commentTestManager.updateLikeStatus(createdComment.id, access_token_user2, 'None');

            const res1 = await commentTestManager.getCommentById(createdComment.id, access_token_user2)

            expect(res1.likesInfo).toEqual({
                likesCount: 1,
                dislikesCount: 0,
                myStatus: Status.None
            })

            const res2 = await commentTestManager.getCommentById(createdComment.id, access_token_user1)

            expect(res2.likesInfo).toEqual({
                likesCount: 1,
                dislikesCount: 0,
                myStatus: Status.Like
            })
        })
    })
})

// 1) создать комент
// 2 зарегать 2 пользователя
// 1ч ставит лайк
// - берем комент от 1ч
// - берем комент 2ч//
