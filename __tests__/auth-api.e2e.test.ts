import {MongoMemoryServer} from "mongodb-memory-server";
import {runDb, usersCollection} from "../src/repositories/db";
import {req} from "./helpers/test-helpers";
import {SETTINGS} from "../src/utils/settings";
import {HTTP_STATUSES} from "../src/utils/http-statuses";
import {usersTestManager} from "./helpers/usersTestManager";
import {DeviceViewModel} from "../src/types/devices-types/DeviceViewModel";
import {authTestManager} from "./helpers/authTestManager";

describe('tests for /auth', () => {
    let server: MongoMemoryServer;

    beforeAll(async () => {
        server = await MongoMemoryServer.create();
        const uri = server.getUri();

        await runDb(uri);
    })

    beforeEach(async () => {
        await usersCollection.drop();
    })

    it("shouldn't login with incorrect incoming data", async () => {
        const data = {
            loginOrEmail: 10,
            password: '   '
        }

        const res = await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(res.body.errorsMessages[0].field).toEqual('loginOrEmail');
        expect(res.body.errorsMessages[1].field).toEqual('password');
    })

    it('should not miss a user whose data does not exist in the database', async () => {
        const data = {
            loginOrEmail: 'backend777',
            password: '222222'
        }

        await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send(data)
            .expect(HTTP_STATUSES.UNAUTHORIZED_401);
    })

    it('must successfully login', async () => {
        const dataForNewUser = {
            email: 'example@example.com',
            login: 'backend777',
            password: '222222'
        }

        const result = await usersTestManager.createUser(dataForNewUser);

        const dataForLogin = {
            loginOrEmail: result.createdUser.login,
            password: '222222'
        }

        const res2 = await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send(dataForLogin)
            .expect(HTTP_STATUSES.SUCCESS_200);

        expect(typeof res2.body.accessToken).toEqual('string');
    })

    describe('session flow', () => {
        let sessionInfo: DeviceViewModel[]
        let refresh_tokens: string[] = []

        it('must log in with different user-agents and return the correct number of sessions', async () => {
            const dataForNewUser = {
                email: 'example@example.com',
                login: 'backend777',
                password: '222222'
            }

            const result = await usersTestManager.createUser(dataForNewUser);

            const dataForLogin = {
                loginOrEmail: result.createdUser.login,
                password: '222222'
            }

            const userAgents = [
                "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0",
                "Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0",
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36",
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36 OPR/38.0.2220.41"
            ];

            for (let userAgent of userAgents) {
                await req
                    .post(SETTINGS.PATH.AUTH + '/login')
                    .set("User-Agent", userAgent)
                    .send(dataForLogin)
                    .expect(HTTP_STATUSES.SUCCESS_200)
                    .then(response => {
                        const refresh_token = response.headers["set-cookie"]
                        refresh_tokens.push(refresh_token);
                    })
            }
            const response = await authTestManager.getActiveSessions(refresh_tokens[0])

            sessionInfo = [...response.body];

            expect(response.body.length).toEqual(4);
            expect(response.body[0].title).toEqual(userAgents[0])
            expect(response.body[1].title).toEqual(userAgents[1]);
            expect(response.body[2].title).toEqual(userAgents[2]);
            expect(response.body[3].title).toEqual(userAgents[3]);
        })

        it('should update refreshToken device 1', async () => {
            // function delay(ms: number) {
            //     return new Promise(resolve => setTimeout(resolve, ms))
            // }

            // await delay(2000);
            const refTokenBeforeUpdate = refresh_tokens[0];

            await req
                .post(SETTINGS.PATH.AUTH + '/refresh-token')
                .set("Cookie", refresh_tokens[0])
                .expect(HTTP_STATUSES.SUCCESS_200)
                .then( response => {
                    const updatedRefToken = response.headers["set-cookie"];
                    refresh_tokens.splice(0, 1, updatedRefToken);
                })

            expect(refresh_tokens[0]).not.toEqual(refTokenBeforeUpdate);

            const response = await authTestManager.getActiveSessions(refresh_tokens[0])

            expect(response.body.length).toEqual(4);
            expect(response.body[0].lastActiveDate).not.toEqual(sessionInfo[0].lastActiveDate);
            expect(response.body[0].deviceId).toEqual(sessionInfo[0].deviceId);
            expect(response.body[1].deviceId).toEqual(sessionInfo[1].deviceId);
            expect(response.body[2].deviceId).toEqual(sessionInfo[2].deviceId);
            expect(response.body[3].deviceId).toEqual(sessionInfo[3].deviceId);
        })

        it('should delete device 2 with refreshToken device 1', async () => {
            await req
                .delete(SETTINGS.PATH.SECURITY_DEVICES + '/' + sessionInfo[1].deviceId)
                .set('Cookie', refresh_tokens[0])
                .expect(HTTP_STATUSES.NO_CONTENT_204);

            const response = await authTestManager.getActiveSessions(refresh_tokens[0])

            expect(response.body.length).toEqual(3);

            for (let session of response.body) {
                expect(session.deviceId).not.toEqual(sessionInfo[1].deviceId);
            }
        })

        it('should logout current device', async () => {
            await req
                .post(SETTINGS.PATH.AUTH + '/logout')
                .set("Cookie", refresh_tokens[2])
                .expect(HTTP_STATUSES.NO_CONTENT_204);

            const response = await authTestManager.getActiveSessions(refresh_tokens[0])

            expect(response.body.length).toEqual(2);

            for (let session of response.body) {
                expect(session.deviceId).not.toEqual(sessionInfo[2].deviceId);
            }
        })

        it('should logout of all devices using device 1', async () => {
            await req
                .delete(SETTINGS.PATH.SECURITY_DEVICES)
                .set("Cookie", refresh_tokens[0])
                .expect(HTTP_STATUSES.NO_CONTENT_204);

            const response = await authTestManager.getActiveSessions(refresh_tokens[0])
            
            expect(response.body.length).toEqual(1);
            expect(response.body[0].deviceId).toEqual(sessionInfo[0].deviceId);
        })
    })
})