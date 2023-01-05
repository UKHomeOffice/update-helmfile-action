import * as github from '@actions/github';
import * as core from '@actions/core';
import * as semver from 'semver';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { ActionInput, ActionInputParam, VersionDoc, Tag } from './types';

const getTagsPromises = (repositoryNames: string[], inputs: ActionInput) => {
    const tagsPromises: Promise<Tag>[] = repositoryNames.map(async (repositoryName) => {
        const { data: tags } = await github.getOctokit(inputs.github_token).rest.repos.listTags({
            owner: github.context.payload.repository.owner.login,
            repo: repositoryName,
        });
        return tags.filter((tag) => semver.valid(tag.name)).sort((a, b) => semver.rcompare(a.name, b.name))[0];
    });
    return tagsPromises;
};

const getActionInputs = (variables: Array<ActionInputParam>): ActionInput => {
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

async function run(): Promise<void> {

    // Get the GH token and version file path
    const inputs: ActionInput = getActionInputs([
        { name: 'github_token', options: { required: true } },
        { name: 'version_file_path', options: { required: true } },
    ]);

    // Get the repos to cycle through later
    const doc: VersionDoc = yaml.load(fs.readFileSync(inputs.version_file_path, 'utf8'));
    const repositoryNames: string[] = Object.keys(doc.versions);

    // Get the tags from the GH repos
    const tagsPromises: Promise<Tag>[] = getTagsPromises(repositoryNames, inputs);

    // When we have all the tags, build the list for the helmfile doc
    const tags: Tag[] = await Promise.all(tagsPromises);
    tags.forEach((tag: Tag, index: number) => {
        doc.versions[repositoryNames[index]] = tag.name;
    });

    fs.writeFileSync(inputs.version_file_path, yaml.dump(doc));
}

run();
