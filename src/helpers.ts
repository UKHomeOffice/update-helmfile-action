import {ActionInput, ActionInputParam, Tag} from './types';
import * as core from '@actions/core';
import * as github from '@actions/github';
import * as semver from 'semver';

export const getActionInputs = (variables: Array<ActionInputParam>): ActionInput => {
    return <ActionInput>variables.reduce((obj, variable) => {
        let value: string = core.getInput(variable.name, variable.options);
        if (!value) {
            if (Object.prototype.hasOwnProperty.call(variable, 'default')) {
                value = variable.default;
            }
        }
        return Object.assign(obj, { [variable.name]: value } );
    }, {});
};

export const getTagsPromises = (repositoryNames: string[], inputs: ActionInput): Promise<Tag>[] => {
    return repositoryNames.map(async (repositoryName) => {
        const { data: tags } = await github.getOctokit(inputs.github_token).rest.repos.listTags({
            owner: github.context.payload.repository.owner.login,
            repo: repositoryName,
        });
        return tags.filter((tag) => semver.valid(tag.name)).sort((a, b) => semver.rcompare(a.name, b.name))[0];
    });
};
