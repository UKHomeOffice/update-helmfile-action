type ActionInputKey = 'github_token' | 'version_file_path' | 'service_file_path';

export type ActionInputParam = {
    name: ActionInputKey,
    options: { required: boolean },
    default?: string
}

export type ActionInput = Record<ActionInputKey, string>

export type VersionDoc = {
    charts: { [key: string]: { serviceVersion: string; } }
}

export type ServiceDoc = {
    charts: { [key: string]: { service : string } }
}

export type Tag = {
    name: string
}
