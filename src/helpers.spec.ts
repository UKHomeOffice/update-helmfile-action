jest.mock('@actions/core');
jest.mock('github');
import { expect, jest, test, describe } from '@jest/globals';
import { ActionInput } from './types';
import { getActionInputs } from './helpers';
import * as core from '@actions/core';

describe('Helpers', () => {
    test('can get the action input values', () => {
        core.getInput.mockReturnValueOnce('mockedGitHubToken');
        core.getInput.mockReturnValueOnce('mock/file/path');
        const expected: ActionInput = {
            github_token: 'mockedGitHubToken',
            version_file_path: 'mock/file/path'
        };

        const result: ActionInput = getActionInputs([
            { name: 'github_token', options: { required: true } },
            { name: 'version_file_path', options: { required: true } }
        ]);

        expect(result).toStrictEqual(expected);
    });

});

