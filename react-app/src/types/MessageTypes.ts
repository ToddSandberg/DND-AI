export type Message = {
    role: string,
    content: string,
    audioId?: string,
    character?: string
}

export type User = {
    name: string|undefined,
    description: string|undefined
}

export type UserError = {
    id: string,
    disabled: boolean,
    message: string,
    isSuccess: boolean
}