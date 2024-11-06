import {PaginationQueryType} from "../../types/PaginationQueryType";

export const getDefaultPaginationOptions = (query: PaginationQueryType) => {
    const queryDefault = {
        searchNameTerm: null,
        sortBy: 'createdAt',
        sortDirection: 'desc',
        pageNumber: "1",
        pageSize: "10"
    }

    return {
        ...queryDefault,
        ...query
    }
}