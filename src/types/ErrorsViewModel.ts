export type ErrorsViewModel = {
    errorsMessages: ErrorModel[]
}

type ErrorModel = {
    message: string,
    field?: string
}