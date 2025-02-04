import {req} from "./test-helpers";
import {SETTINGS} from "../../src/utils/settings";
import {HTTP_STATUSES} from "../../src/utils/http-statuses";
import {LoginInputModel} from "../../src/types/auth-types/LoginInputModel";

export const authTestManager = {
    async getActiveSessions(refresh_token: string) {
        return req
            .get(SETTINGS.PATH.SECURITY_DEVICES)
            .set("Cookie", refresh_token)
            .expect(HTTP_STATUSES.SUCCESS_200);
    },

    async login(data: LoginInputModel): Promise<string> {
        const res = await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .set("User-Agent", "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0")
            .send(data)
            .expect(HTTP_STATUSES.SUCCESS_200);

        expect(typeof res.body.accessToken).toEqual('string');

        return res.body.accessToken as string
    }
}