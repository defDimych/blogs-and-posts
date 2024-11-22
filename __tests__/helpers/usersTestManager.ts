import {HTTP_STATUSES, HttpStatusType} from "../../src/utils/http-statuses";
import {req} from "./test-helpers";
import {SETTINGS} from "../../src/utils/settings";
import {fromUTF8ToBase64} from "../../src/middlewares/auth/basic-auth-middleware";
import {UserInputModel} from "../../src/types/users-types/UserInputModel";

export const usersTestManager = {
    async createUser(data: UserInputModel, expectedStatusCode: HttpStatusType = HTTP_STATUSES.CREATED_201) {
        const res = await req
            .post(SETTINGS.PATH.USERS)
            .set({"Authorization": 'Basic ' + fromUTF8ToBase64(SETTINGS.CREDENTIALS)})
            .send(data)
            .expect(expectedStatusCode)

        let createdEntity;

        if (expectedStatusCode === HTTP_STATUSES.CREATED_201) {
            createdEntity = res.body;

            expect(typeof res.body.id).toEqual('string');
            expect(typeof res.body.createdAt).toEqual('string');
            expect(res.body.login).toEqual(data.login);
            expect(res.body.email).toEqual(data.email);
        }
        return {res, createdUser: createdEntity};
    }
}