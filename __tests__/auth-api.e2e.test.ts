import {MongoMemoryServer} from "mongodb-memory-server";
import {runDb, usersCollection} from "../src/repositories/db";
import {req} from "./helpers/test-helpers";
import {SETTINGS} from "../src/utils/settings";
import {HTTP_STATUSES} from "../src/utils/http-statuses";
import {usersTestManager} from "./helpers/usersTestManager";

describe('tests for /auth',() => {
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

        await usersTestManager.createUser(dataForNewUser);

        const dataForLogin = {
            loginOrEmail: 'backend777',
            password: '222222'
        }

        const res2 = await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send(dataForLogin)
            .expect(HTTP_STATUSES.SUCCESS_200);

        expect(typeof res2.body.accessToken).toEqual('string');
    })
})