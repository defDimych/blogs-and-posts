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

        it('', async () => {
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

            await req
                .put(SETTINGS.PATH.COMMENTS + '/' + createdComment.id + '/like-status')
                .set({"Authorization": "Bearer " + access_token_user1})
                .send({"likeStatus": "Like"})
                .expect(HTTP_STATUSES.NO_CONTENT_204);

            const res1 = await req
                .get(SETTINGS.PATH.COMMENTS + '/' + createdComment.id)
                .set({"Authorization": "Bearer " + access_token_user1})
                .expect(HTTP_STATUSES.SUCCESS_200)

            expect(res1.body.likesInfo).toEqual({
                likesCount: 1,
                dislikesCount: 0,
                myStatus: Status.Like
            })

            const res2 = await req
                .get(SETTINGS.PATH.COMMENTS + '/' + createdComment.id)
                .set({"Authorization": "Bearer " + access_token_user2})
                .expect(HTTP_STATUSES.SUCCESS_200)

            console.log(res2.body.likesInfo)

            expect(res2.body.likesInfo).toEqual({
                likesCount: 1,
                dislikesCount: 0,
                myStatus: Status.None
            })
        })
    })
})

// 1) создать комент
// 2 зарегать 2 пользователя
// 1ч ставит лайк
// - берем комент от 1ч
// - берем комент 2ч//
