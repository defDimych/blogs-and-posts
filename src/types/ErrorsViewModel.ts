export type ErrorsViewModel = {
    errorsMessages: ErrorModel[]
}

type ErrorModel = {
    message: string | null,
    field: string | null
}