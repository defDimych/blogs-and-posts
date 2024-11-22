import {req} from "./test-helpers";
import {SETTINGS} from "../../src/utils/settings";
import {fromUTF8ToBase64} from "../../src/middlewares/auth/basic-auth-middleware";
import {HTTP_STATUSES, HttpStatusType} from "../../src/utils/http-statuses";
import {PostInputModel} from "../../src/types/posts-types/PostInputModel";

export const postsTestManager = {
    async createPost(data: PostInputModel, expectedStatusCode: HttpStatusType = HTTP_STATUSES.CREATED_201) {
        const res = await req
            .post(SETTINGS.PATH.POSTS)
            .set({"Authorization": 'Basic ' + fromUTF8ToBase64(SETTINGS.CREDENTIALS)})
            .send(data)
            .expect(expectedStatusCode);

        let createdEntity;

        if (expectedStatusCode === HTTP_STATUSES.CREATED_201) {
            createdEntity = res.body;

            expect(res.body.title).toEqual(data.title);
            expect(res.body.shortDescription).toEqual(data.shortDescription);
            expect(res.body.content).toEqual(data.content);
            expect(res.body.blogId).toEqual(data.blogId);
            expect(typeof res.body.id).toEqual('string');
            expect(typeof res.body.blogName).toEqual('string');
            expect(typeof res.body.createdAt).toEqual('string');
        }

        return {res, createdPost: createdEntity};
    }
}