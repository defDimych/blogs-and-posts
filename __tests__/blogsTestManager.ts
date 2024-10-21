import {BlogInputModel} from "../src/types/blogs-types/BlogInputModel";
import {req} from "./test-helpers";
import {SETTINGS} from "../src/utils/settings";
import {fromUTF8ToBase64} from "../src/middlewares/auth/basic-auth-middleware";
import {HTTP_STATUSES, HttpStatusType} from "../src/utils/http-statuses";

export const blogsTestManager = {
    async createBlog(data: BlogInputModel, expectedStatusCode: HttpStatusType = HTTP_STATUSES.CREATED_201) {
        const res = await req
            .post(SETTINGS.PATH.BLOGS)
            .set({"Authorization": 'Basic ' + fromUTF8ToBase64(SETTINGS.CREDENTIALS)})
            .send(data)
            .expect(expectedStatusCode)

        let createdEntity;

        if (expectedStatusCode === HTTP_STATUSES.CREATED_201) {
            createdEntity = res.body;

            expect(res.body.name).toEqual(data.name);
            expect(res.body.description).toEqual(data.description);
            expect(res.body.websiteUrl).toEqual(data.websiteUrl);
            expect(typeof res.body.id).toEqual('string');
        }

        return {res, createdEntity};
    }
}