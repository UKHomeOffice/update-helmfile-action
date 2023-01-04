import * as github from '@actions/github';
import * as core from '@actions/core';
import * as semver from 'semver';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

type ActionInputParam = {
    name: string,
    options: { required: boolean },
    default?: string
}

type ActionInput = {
    github_token: string,
    version_file_path: string
}

async function run(): Promise<void> {

    const inputs = getActionInputs([
        { name: 'github_token', options: { required: true } },
        { name: 'version_file_path', options: { required: true } },
    ]);

    const doc = yaml.load(fs.readFileSync(inputs.version_file_path, 'utf8'));
    const repositoryNames: string[] = Object.keys(doc.versions);

    const tagsPromises = repositoryNames.map(async (repositoryName) => {
        const { data: tags } = await github.getOctokit(inputs.github_token).rest.repos.listTags({
            owner: github.context.payload.repository.owner.login,
            repo: repositoryName,
        });
        return tags.filter((tag) => semver.valid(tag.name)).sort((a, b) => semver.rcompare(a.name, b.name))[0];
    });

    const tags = await Promise.all(tagsPromises);
    tags.forEach((tag, index) => {
        doc.versions[repositoryNames[index]] = tag.name;
    });

    fs.writeFileSync(inputs.version_file_path, yaml.dump(doc));
}

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

run();
