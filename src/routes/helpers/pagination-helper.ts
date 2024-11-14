import {PaginationQueryType} from "../../types/PaginationQueryType";
import {SortDirection} from "mongodb";

 export type  PaginationType =  {
    searchNameTerm: string | null,
     searchLoginTerm: string | null,
     searchEmailTerm: string | null,
     sortBy: string,
     sortDirection:SortDirection,
     pageNumber:number,
     pageSize:number
}

export const getDefaultPaginationOptions = (query: PaginationQueryType):PaginationType => {
    return {
        searchNameTerm: query.searchNameTerm ? query.searchNameTerm : null,
        searchLoginTerm: query.searchLoginTerm ? query.searchLoginTerm : null,
        searchEmailTerm: query.searchEmailTerm ? query.searchEmailTerm : null,
        sortBy: query.sortBy ? query.sortBy : 'createdAt',
        sortDirection: query.sortDirection && query.sortDirection === 'asc' ? 'asc' : 'desc',
        pageNumber: query.pageNumber ? +query.pageNumber : 1,
        pageSize: query.pageSize ? +query.pageSize : 10
    }
}