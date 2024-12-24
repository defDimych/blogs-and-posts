import {req} from "./test-helpers";
import {SETTINGS} from "../../src/utils/settings";
import {HTTP_STATUSES} from "../../src/utils/http-statuses";

export const authTestManager = {
    async getActiveSessions(refresh_token: string) {
        return req
            .get(SETTINGS.PATH.SECURITY_DEVICES)
            .set("Cookie", refresh_token)
            .expect(HTTP_STATUSES.SUCCESS_200);
    }
}