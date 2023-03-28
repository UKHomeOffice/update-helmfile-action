jest.mock('@actions/core');
import { expect, jest, test, describe } from '@jest/globals';
import { ActionInput, Tag, VersionDoc } from './types';
import { getActionInputs, updateVersions } from './helpers';
import * as core from '@actions/core';

describe('Helpers', () => {
    test('can get the action input values', () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        core.getInput.mockReturnValueOnce('mockedGitHubToken');
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        core.getInput.mockReturnValueOnce('mock/file/path/version');
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        core.getInput.mockReturnValueOnce('mock/file/path/service');
        const expected: ActionInput = {
            github_token: 'mockedGitHubToken',
            version_file_path: 'mock/file/path/version',
            service_file_path: 'mock/file/path/service',
        };

        const result: ActionInput = getActionInputs([
            { name: 'github_token', options: { required: true } },
            { name: 'version_file_path', options: { required: true } },
            { name: 'service_file_path', options: { required: true } },
        ]);

        expect(result).toStrictEqual(expected);
    });

    test('can update version doc', () => {
        const tags: Tag[] = [{ name: '2.0.0' }];
        const doc: VersionDoc = { charts: {
            reponame: {
                serviceVersion: '1.0.0'
            },
            anothername: {
                serviceVersion: '1.0.0'
            },
        } };
        const repositoryNames: string[] = ['reponame', 'anothername'];

        const expected = { charts: {
            reponame: {
                serviceVersion: '2.0.0'
            },
            anothername: {
                serviceVersion: '1.0.0'
            },
        } };

        const result = updateVersions(tags, doc, repositoryNames);

        expect(result).toStrictEqual(expected);
    });
});
