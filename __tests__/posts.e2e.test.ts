import {describe} from "node:test";
import {req} from "./test-helpers";
import {SETTINGS} from "../src/utils/settings";
import {HTTP_STATUSES} from "../src/utils/http-statuses";
import {fromUTF8ToBase64} from "../src/middlewares/auth/basic-auth-middleware";
import {PostViewModel} from "../src/types/posts-types/PostViewModel";
import {blogsTestManager} from "./blogsTestManager";
import {MongoMemoryServer} from "mongodb-memory-server";
import {postsCollection, runDb} from "../src/repositories/db";

describe('tests for /posts', async () => {
    let server: MongoMemoryServer;

    beforeAll(async () => {
        server = await MongoMemoryServer.create();
        const uri = server.getUri();

        await runDb(uri);
        await postsCollection.drop();
    })

    it('should return 200 and empty array', async () => {
        await req
            .get(SETTINGS.PATH.POSTS)
            .expect(HTTP_STATUSES.SUCCESS_200, []);
    })

    it('shouldn\'t create entity 401', async () => {
        const data = {
            name: 'dev1',
            description: 'dev2',
            websiteUrl: 'http://some.com'
        }

        await req
            .post(SETTINGS.PATH.POSTS)
            .send(data)
            .expect(HTTP_STATUSES.UNAUTHORIZED_401);

        await req
            .get(SETTINGS.PATH.POSTS)
            .expect(HTTP_STATUSES.SUCCESS_200, []);
    })

    let createdPost1: PostViewModel | null = null;
    it('should create entity', async () => {
        const newBlog = {
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://it-incubator.io/en'
        }

        const {createdEntity} = await blogsTestManager.createBlog(newBlog);

        const newPost = {
            title: 't1',
            shortDescription: 's1',
            content: 'c1',
            blogId: createdEntity.id
        }

        const res = await req
            .post(SETTINGS.PATH.POSTS)
            .set({"Authorization": 'Basic ' + fromUTF8ToBase64(SETTINGS.CREDENTIALS)})
            .send(newPost)
            .expect(HTTP_STATUSES.CREATED_201);

        createdPost1 = res.body;

        expect(res.body.title).toEqual(newPost.title);
        expect(res.body.shortDescription).toEqual(newPost.shortDescription);
        expect(res.body.content).toEqual(newPost.content);
        expect(res.body.blogId).toEqual(newPost.blogId);
        expect(typeof res.body.id).toEqual('string');
        expect(typeof res.body.blogName).toEqual('string');

        await req
            .get(SETTINGS.PATH.POSTS)
            .expect(HTTP_STATUSES.SUCCESS_200, [createdPost1]);
    })

    it('Should not create an entity with incorrect input data', async () => {
        const data = {
            title: 45,
            shortDescription: '',
            content: '',
            blogId: -100
        }

        const res = await req
            .post(SETTINGS.PATH.POSTS)
            .set({"Authorization": 'Basic ' + fromUTF8ToBase64(SETTINGS.CREDENTIALS)})
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(res.body.errorsMessages[0].field).toEqual('title');
        expect(res.body.errorsMessages[1].field).toEqual('shortDescription');
        expect(res.body.errorsMessages[2].field).toEqual('content');
        expect(res.body.errorsMessages[3].field).toEqual('blogId');

        await req
            .get(SETTINGS.PATH.POSTS)
            .expect(HTTP_STATUSES.SUCCESS_200, [createdPost1]);
    })


    it('should return 404 for not existing entity', async () => {
        await req
            .get(SETTINGS.PATH.POSTS + '/' + -100)
            .expect(HTTP_STATUSES.NOT_FOUND_404);
    })

    it('Must find an existing entity.', async () => {
        await req
            .get(SETTINGS.PATH.POSTS + '/' + createdPost1!.id)
            .expect(HTTP_STATUSES.SUCCESS_200, createdPost1);
    })

    it('Shouldn\'t update a non-existent entity', async () => {
        const data = {
            title: 't1',
            shortDescription: 's1',
            content: 'c1',
            blogId: createdPost1!.blogId
        }

        await req
            .put(SETTINGS.PATH.POSTS + '/' + -100)
            .set({ "Authorization": 'Basic ' + fromUTF8ToBase64(SETTINGS.CREDENTIALS) })
            .send(data)
            .expect(HTTP_STATUSES.NOT_FOUND_404);
    })

    it('Must update existing entity', async () => {
        const data = {
            title: 't2',
            shortDescription: 's2',
            content: 'c2',
            blogId: createdPost1!.blogId
        }

        await req
            .put(SETTINGS.PATH.POSTS + '/' + createdPost1!.id)
            .set({ "Authorization": 'Basic ' + fromUTF8ToBase64(SETTINGS.CREDENTIALS) })
            .send(data)
            .expect(HTTP_STATUSES.NO_CONTENT_204);
    })

    it('Shouldn\'t delete a non-existent entity', async () => {
        await req
            .delete(SETTINGS.PATH.POSTS + '/' + -100)
            .set({"Authorization": 'Basic ' + fromUTF8ToBase64(SETTINGS.CREDENTIALS)})
            .expect(HTTP_STATUSES.NOT_FOUND_404);
    })

    it('Must delete existing entity', async () => {
        await req
            .delete(SETTINGS.PATH.POSTS + '/' + createdPost1!.id)
            .set({"Authorization": 'Basic ' + fromUTF8ToBase64(SETTINGS.CREDENTIALS)})
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        await req
            .get(SETTINGS.PATH.POSTS)
            .expect(HTTP_STATUSES.SUCCESS_200, []);
    })

    // afterAll(done => {
    //     done();
    // })
})