export type Message = {
    role: string,
    content: string,
    audioId?: string,
    character?: string
}

export type User = {
    name: string,
    description: string
}