import {describe} from "node:test";
import {req} from "./test-helpers";
import {SETTINGS} from "../src/utils/settings";
import {HTTP_STATUSES} from "../src/utils/http-statuses";
import {fromUTF8ToBase64} from "../src/middlewares/auth/basic-auth-middleware";

describe('tests for /blogs', () => {
    beforeAll(async () => {
        await req.delete(SETTINGS.PATH.TESTS).expect(HTTP_STATUSES.NO_CONTENT_204);
    })

    it ('should return 200 and empty array', async () => {
        await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(HTTP_STATUSES.SUCCESS_200, []);
    })

    it ('shouldn\'t create entity 401', async () => {
        const data = {
            name: 'dev1',
            description: 'dev2',
            websiteUrl: 'http://some.com'
        }

        await req
            .post(SETTINGS.PATH.BLOGS)
            .send(data)
            .expect(HTTP_STATUSES.UNAUTHORIZED_401);

        await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(HTTP_STATUSES.SUCCESS_200, []);
    })

    it ('should create entity', async () => {
        const data = {
            name: 'Dimych',
            description: 'Developer',
            websiteUrl: 'https://it-incubator.io/en'
        }

        const res = await req
            .post(SETTINGS.PATH.BLOGS)
            .set({ "Authorization": 'Basic ' + fromUTF8ToBase64(SETTINGS.CREDENTIALS) })
            .send(data)
            .expect(HTTP_STATUSES.CREATED_201)

        // TODO: Зачем нужно сопоставлять объекты?
        expect(res.body.name).toEqual(data.name);
        expect(res.body.description).toEqual(data.description);
        expect(res.body.websiteUrl).toEqual(data.websiteUrl);
        expect(typeof res.body.id).toEqual('string');

        await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(HTTP_STATUSES.SUCCESS_200, [res.body]);
    })
})