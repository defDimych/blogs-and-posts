import {describe} from "node:test";
import {req} from "./test-helpers";
import {SETTINGS} from "../src/utils/settings";
import {HTTP_STATUSES} from "../src/utils/http-statuses";
import {fromUTF8ToBase64} from "../src/middlewares/auth/basic-auth-middleware";
import {BlogViewModel} from "../src/types/blogs-types/BlogViewModel";
import {blogsTestManager} from "./blogsTestManager";

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

    let createdBlog1: BlogViewModel | null = null;
    it ('should create entity', async () => {
        const data = {
            name: 'Dimych',
            description: 'Developer',
            websiteUrl: 'https://it-incubator.io/en'
        }

        const {createdEntity} = await blogsTestManager.createBlog(data, HTTP_STATUSES.CREATED_201);

        createdBlog1 = createdEntity;

        await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(HTTP_STATUSES.SUCCESS_200, [createdBlog1]);
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
            .expect(HTTP_STATUSES.SUCCESS_200, [createdBlog1]);
    })

    it('should return 404 for not existing entity', async () => {
        await req
            .get(SETTINGS.PATH.BLOGS + '/' + -100)
            .expect(HTTP_STATUSES.NOT_FOUND_404);
    })

    it('Must find an existing entity.', async () => {
        await req
            .get(SETTINGS.PATH.BLOGS + '/' + createdBlog1!.id)
            .expect(HTTP_STATUSES.SUCCESS_200, createdBlog1);
    })

    it('Shouldn\'t update a non-existent entity', async () => {
        const data = {
            name: 'Dimych',
            description: 'Developer',
            websiteUrl: 'https://it-incubator.io/en'
        }

        await req
            .put(SETTINGS.PATH.BLOGS + '/' + -100)
            .set({ "Authorization": 'Basic ' + fromUTF8ToBase64(SETTINGS.CREDENTIALS) })
            .send(data)
            .expect(HTTP_STATUSES.NOT_FOUND_404);
    })

    it('Must update existing entity', async () => {
        const data = {
            name: 'Pavel',
            description: 'Developer',
            websiteUrl: 'https://it-incubator.io/en'
        }

        await req
            .put(SETTINGS.PATH.BLOGS + '/' + createdBlog1!.id)
            .set({ "Authorization": 'Basic ' + fromUTF8ToBase64(SETTINGS.CREDENTIALS) })
            .send(data)
            .expect(HTTP_STATUSES.NO_CONTENT_204);
    })

    it('Shouldn\'t delete a non-existent entity', async () => {
        await req
            .delete(SETTINGS.PATH.BLOGS + '/' + -100)
            .set({"Authorization": 'Basic ' + fromUTF8ToBase64(SETTINGS.CREDENTIALS)})
            .expect(HTTP_STATUSES.NOT_FOUND_404);
    })

    it('Must delete existing entity', async () => {
        await req
            .delete(SETTINGS.PATH.BLOGS + '/' + createdBlog1!.id)
            .set({"Authorization": 'Basic ' + fromUTF8ToBase64(SETTINGS.CREDENTIALS)})
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(HTTP_STATUSES.SUCCESS_200, []);
    })
})