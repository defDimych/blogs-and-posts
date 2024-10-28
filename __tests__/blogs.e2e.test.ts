import {describe} from "node:test";
import {req} from "./test-helpers";
import {SETTINGS} from "../src/utils/settings";
import {HTTP_STATUSES} from "../src/utils/http-statuses";
import {fromUTF8ToBase64} from "../src/middlewares/auth/basic-auth-middleware";
import {blogsTestManager} from "./blogsTestManager";
import {MongoMemoryServer} from "mongodb-memory-server";
import {blogsCollection, runDb} from "../src/repositories/db";
import {ObjectId} from "mongodb";

describe('tests for /blogs', async () => {
    let server: MongoMemoryServer;

    beforeAll(async () => {
        server = await MongoMemoryServer.create();
        const uri = server.getUri();

        await runDb(uri);
    })

    beforeEach(async () => {
        await blogsCollection.drop();
    })

    it ('should return 200 and empty array', async () => {
        await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(HTTP_STATUSES.SUCCESS_200, []);
    })

    it ('shouldn\'t create entity 401', async () => {
        const data = {
            name: 'n1',
            description: 'd2',
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
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://it-incubator.io/en'
        }

        const {createdBlog} = await blogsTestManager.createBlog(data);

        await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(HTTP_STATUSES.SUCCESS_200, [createdBlog]);
    })

    it ('Should not create an entity with incorrect input data', async () => {
        const data = {
            name: '',
            description: '',
            websiteUrl: 'Dev'
        }

        const {res} = await blogsTestManager.createBlog(data, HTTP_STATUSES.BAD_REQUEST_400);

        expect(res.body.errorsMessages[0].field).toEqual('name');
        expect(res.body.errorsMessages[1].field).toEqual('description');
        expect(res.body.errorsMessages[2].field).toEqual('websiteUrl');

        await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(HTTP_STATUSES.SUCCESS_200, []);
    })

    it('should return 404 for not existing entity', async () => {
        const id = new ObjectId();

        await req
            .get(SETTINGS.PATH.BLOGS + '/' + id)
            .expect(HTTP_STATUSES.NOT_FOUND_404);
    })

    it('Must find an existing entity.', async () => {
        const data = {
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://it-incubator.io/en'
        }

        const {createdBlog} = await blogsTestManager.createBlog(data);

        await req
            .get(SETTINGS.PATH.BLOGS + '/' + createdBlog.id)
            .expect(HTTP_STATUSES.SUCCESS_200, createdBlog);
    })

    it('Shouldn\'t update a non-existent entity', async () => {
        const id = new ObjectId();

        const data = {
            name: 'Dimych',
            description: 'Developer',
            websiteUrl: 'https://it-incubator.io/en'
        }

        await req
            .put(SETTINGS.PATH.BLOGS + '/' + id)
            .set({ "Authorization": 'Basic ' + fromUTF8ToBase64(SETTINGS.CREDENTIALS) })
            .send(data)
            .expect(HTTP_STATUSES.NOT_FOUND_404);
    })

    it('Must update existing entity', async () => {
        const data = {
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://it-incubator.io/en'
        }

        const dataToUpdate = {
            name: 'n2',
            description: 'd2',
            websiteUrl: 'https://it-incubator.io/en'
        }

        const {createdBlog} = await blogsTestManager.createBlog(data);

        await req
            .put(SETTINGS.PATH.BLOGS + '/' + createdBlog.id)
            .set({ "Authorization": 'Basic ' + fromUTF8ToBase64(SETTINGS.CREDENTIALS) })
            .send(dataToUpdate)
            .expect(HTTP_STATUSES.NO_CONTENT_204);
    })

    it('Shouldn\'t delete a non-existent entity', async () => {
        const id = new ObjectId();

        await req
            .delete(SETTINGS.PATH.BLOGS + '/' + id)
            .set({"Authorization": 'Basic ' + fromUTF8ToBase64(SETTINGS.CREDENTIALS)})
            .expect(HTTP_STATUSES.NOT_FOUND_404);
    })

    it('Must delete existing entity', async () => {
        const data = {
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://it-incubator.io/en'
        }

        const {createdBlog} = await blogsTestManager.createBlog(data);

        await req
            .delete(SETTINGS.PATH.BLOGS + '/' + createdBlog.id)
            .set({"Authorization": 'Basic ' + fromUTF8ToBase64(SETTINGS.CREDENTIALS)})
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(HTTP_STATUSES.SUCCESS_200, []);
    })
})