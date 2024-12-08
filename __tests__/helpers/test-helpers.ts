import {agent} from "supertest";
import {app} from "../../src/app";
import {PaginationQueryType} from "../../src/types/PaginationQueryType";
import {HTTP_STATUSES} from "../../src/utils/http-statuses";

export const req = agent(app);

export const paginationTestHelper = async (queryData: PaginationQueryType, path: string) => {
    const res1 = await req.get(path);

    const sorted = [...res1.body.items].sort((a: any, b: any) => {
        if (a.createdAt > b.createdAt) {
            return 1;
        }
        if (a.createdAt < b.createdAt) {
            return -1;
        }
        return 0;
    })

    const res2 = await req
        .get(path)
        .query(queryData)
        .expect(HTTP_STATUSES.SUCCESS_200);

    expect(res2.body.pagesCount).toEqual(Math.ceil(res1.body.items.length / +queryData.pageSize));
    expect(res2.body.page).toEqual(+queryData.pageNumber);
    expect(res2.body.pageSize).toEqual(+queryData.pageSize);
    expect(res2.body.totalCount).toEqual(res1.body.items.length);
    expect(res2.body.items).toEqual(sorted);
}