const github = require("@actions/github");
const core = require("@actions/core");
const semver = require("semver");
const fs = require('fs');
const yaml = require('js-yaml');

async function run() {

    const inputs = getActionInputs([
        { name: "github_token", options: { required: true } },
        { name: "version_file_path", options: { required: true } },
    ]);

    const doc = yaml.load(fs.readFileSync(inputs.version_file_path, 'utf8'));
    const repositoryNames = Object.keys(doc.versions);

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

const getActionInputs = (variables) => {
    return variables.reduce((obj, variable) => {
        let value = core.getInput(variable.name, variable.options);
        if (!value) {
            if (variable.hasOwnProperty("default")) {
                value = variable.default;
            }
        }
        return Object.assign(obj, { [variable.name]: value });
    }, {});
};

run();
