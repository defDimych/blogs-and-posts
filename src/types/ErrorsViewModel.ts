export type ErrorsViewModel = {
    errorsMessages: ErrorModel[] | null
}

type ErrorModel = {
    message: string | null,
    field: string | null
}