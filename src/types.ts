export type ActionInputParam = {
    name: string,
    options: { required: boolean },
    default?: string
}

export type ActionInput = {
    github_token: string,
    version_file_path: string
}

export type VersionDoc = {
    versions: RepositoryVersion[]
}

type RepositoryVersion = {
    repositoryName: string,
    version: string
}

export type Tag = {
    name: string
}
