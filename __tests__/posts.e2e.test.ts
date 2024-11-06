import {describe} from "node:test";
import {req} from "./test-helpers";
import {SETTINGS} from "../src/utils/settings";
import {HTTP_STATUSES} from "../src/utils/http-statuses";
import {fromUTF8ToBase64} from "../src/middlewares/auth/basic-auth-middleware";
import {blogsTestManager} from "./blogsTestManager";
import {MongoMemoryServer} from "mongodb-memory-server";
import {postsCollection, runDb} from "../src/repositories/db";
import {ObjectId} from "mongodb";
import {postsTestManager} from "./postsTestManager";

describe('tests for /posts', async () => {
    let server: MongoMemoryServer;

    beforeAll(async () => {
        server = await MongoMemoryServer.create();
        const uri = server.getUri();

        await runDb(uri);
    })

    beforeEach(async () => {
        await postsCollection.drop();
    })

    it('should return 200 and default values', async () => {
        const res = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(HTTP_STATUSES.SUCCESS_200);

        expect(res.body).toEqual({
            pagesCount: 0,
            page: 1,
            pageSize: 10,
            totalCount: 0,
            items: []
        })
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

        const res = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(HTTP_STATUSES.SUCCESS_200);

        expect(res.body).toEqual({
            pagesCount: 0,
            page: 1,
            pageSize: 10,
            totalCount: 0,
            items: []
        })
    })

    it('should create entity', async () => {
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

        await req
            .get(SETTINGS.PATH.POSTS + '/' + createdPost.id)
            .expect(HTTP_STATUSES.SUCCESS_200, {
                ...createdPost
            });
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

        const response = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(HTTP_STATUSES.SUCCESS_200);

        expect(response.body).toEqual({
            pagesCount: 0,
            page: 1,
            pageSize: 10,
            totalCount: 0,
            items: []
        })
    })


    it('should return 404 for not existing entity', async () => {
        const id = new ObjectId();

        await req
            .get(SETTINGS.PATH.POSTS + '/' + id)
            .expect(HTTP_STATUSES.NOT_FOUND_404);
    })

    it('Must find an existing entity.', async () => {
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

        await req
            .get(SETTINGS.PATH.POSTS + '/' + createdPost.id)
            .expect(HTTP_STATUSES.SUCCESS_200, createdPost);
    })

    it('Shouldn\'t update a non-existent entity', async () => {
        const newBlog = {
            name: 'n1',
            description: 'd1',
            websiteUrl: 'https://it-incubator.io/en'
        }

        const {createdBlog} = await blogsTestManager.createBlog(newBlog);

        const data = {
            title: 't1',
            shortDescription: 's1',
            content: 'c1',
            blogId: createdBlog.id
        }

        await req
            .put(SETTINGS.PATH.POSTS + '/' + new ObjectId())
            .set({ "Authorization": 'Basic ' + fromUTF8ToBase64(SETTINGS.CREDENTIALS) })
            .send(data)
            .expect(HTTP_STATUSES.NOT_FOUND_404);
    })

    it('Must update existing entity', async () => {
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

        const data = {
            title: 't2',
            shortDescription: 's2',
            content: 'c2',
            blogId: createdPost.blogId
        }

        await req
            .put(SETTINGS.PATH.POSTS + '/' + createdPost.id)
            .set({ "Authorization": 'Basic ' + fromUTF8ToBase64(SETTINGS.CREDENTIALS) })
            .send(data)
            .expect(HTTP_STATUSES.NO_CONTENT_204);
    })

    it('Shouldn\'t delete a non-existent entity', async () => {
        const id = new ObjectId();

        await req
            .delete(SETTINGS.PATH.POSTS + '/' + id)
            .set({"Authorization": 'Basic ' + fromUTF8ToBase64(SETTINGS.CREDENTIALS)})
            .expect(HTTP_STATUSES.NOT_FOUND_404);
    })

    it('Must delete existing entity', async () => {
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

        await req
            .delete(SETTINGS.PATH.POSTS + '/' + createdPost.id)
            .set({"Authorization": 'Basic ' + fromUTF8ToBase64(SETTINGS.CREDENTIALS)})
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        const res = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(HTTP_STATUSES.SUCCESS_200);

        expect(res.body).toEqual({
            pagesCount: 0,
            page: 1,
            pageSize: 10,
            totalCount: 0,
            items: []
        })
    })
})