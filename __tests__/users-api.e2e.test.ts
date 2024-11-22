import {req} from "./helpers/test-helpers";
import {SETTINGS} from "../src/utils/settings";
import {fromUTF8ToBase64} from "../src/middlewares/auth/basic-auth-middleware";
import {HTTP_STATUSES} from "../src/utils/http-statuses";
import {MongoMemoryServer} from "mongodb-memory-server";
import {runDb, usersCollection} from "../src/repositories/db";
import {usersTestManager} from "./helpers/usersTestManager";

describe('tests for /users', () => {
    let server: MongoMemoryServer;

    beforeAll(async () => {
        server = await MongoMemoryServer.create();
        const uri = server.getUri();

        await runDb(uri);
    })

    beforeEach(async () => {
        await usersCollection.drop();
    })

    it('should not create a entity with incorrect input data', async () => {
        const data = {
            login: 10,
            password: '222',
            email: 'email'
        }

        const res = await req
            .post(SETTINGS.PATH.USERS)
            .set({"Authorization": 'Basic ' + fromUTF8ToBase64(SETTINGS.CREDENTIALS)})
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(res.body.errorsMessages[0].field).toEqual('login');
        expect(res.body.errorsMessages[1].field).toEqual('password');
        expect(res.body.errorsMessages[2].field).toEqual('email');
    })

    it('must create an entity with correct input data', async () => {
        const data = {
            email: 'example@example.com',
            login: 'backend777',
            password: '222222'
        }

        await usersTestManager.createUser(data);
    })

    it("shouldn't create a user if email and login are not unique", async () => {
        const dataForNewUser1 = {
            email: 'example@example.com',
            login: 'backend777',
            password: '222222'
        }

        await usersTestManager.createUser(dataForNewUser1);

        const dataForNewUser2 = {
            email: 'example@example.com',
            login: 'backend777',
            password: '222222'
        }

        const res = await req
            .post(SETTINGS.PATH.USERS)
            .set({"Authorization": 'Basic ' + fromUTF8ToBase64(SETTINGS.CREDENTIALS)})
            .send(dataForNewUser2)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(res.body.errorsMessages[0].field).toEqual('login');
    })
})