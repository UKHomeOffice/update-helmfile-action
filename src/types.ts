type ActionInputKey = 'github_token' | 'version_file_path';

export type ActionInputParam = {
    name: ActionInputKey,
    options: { required: boolean },
    default?: string
}

export type ActionInput = Record<ActionInputKey, string>

export type VersionDoc = {
    versions: { [key: string]: string }
}

export type Tag = {
    name: string
}
