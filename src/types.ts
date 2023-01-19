type ActionInputKey = 'github_token' | 'version_file_path';

export type ActionInputParam = {
    name: ActionInputKey,
    options: { required: boolean },
    default?: string
}

export type ActionInput = Record<ActionInputKey, string>

export type VersionDoc = {
    versions: Repository[]
}

type RepositoryName = string;
type RepositoryVersion = string;

type Repository = Record<RepositoryName, RepositoryVersion>

export type Tag = {
    name: string
}
