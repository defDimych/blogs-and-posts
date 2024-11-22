import {HTTP_STATUSES} from "./http-statuses";
import {ErrorsViewModel} from "../types/ErrorsViewModel";

export const handleError = (status: DomainStatusCode): number => {
    switch (status) {
        case DomainStatusCode.Forbidden:
            return HTTP_STATUSES.FORBIDDEN_403
        case DomainStatusCode.NotFound:
            return HTTP_STATUSES.NOT_FOUND_404

        case DomainStatusCode.BadRequest:
        case DomainStatusCode.EmailNotSend:
            return HTTP_STATUSES.BAD_REQUEST_400

        case DomainStatusCode.Unauthorized:
            return HTTP_STATUSES.UNAUTHORIZED_401

        default:
            return 500
    }
}

export type Result<Data> = {
    status: DomainStatusCode;
    extensions: ErrorsViewModel | [];
    data: Data | null
}

export enum DomainStatusCode {
    Success = 0,
    NotFound = 1,
    Forbidden = 2,
    Unauthorized = 3,
    BadRequest  = 4,
    EmailNotSend = 50
}

export const objectResult = {
    success<T>(data: T): Result<T> {
        return {
            status: DomainStatusCode.Success,
            data,
            extensions: []
        }
    },

    unauthorized(): Result<null> {
        return {
            status: DomainStatusCode.Unauthorized,
            data: null,
            extensions: []
        }
    },

    notFound(): Result<null> {
        return {
            status: DomainStatusCode.NotFound,
            data: null,
            extensions: []
        }
    },

    forbidden(): Result<null> {
        return {
            status: DomainStatusCode.Forbidden,
            data: null,
            extensions: []
        }
    }
}



