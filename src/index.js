const github = require("@actions/github");
const core = require("@actions/core");
const semver = require("semver");
const fs = require('fs');
const yaml = require('js-yaml');

async function run() {


    const QA_VERSIONS_PATH = './environments/qa/versions.yaml';

    const doc = yaml.load(fs.readFileSync(QA_VERSIONS_PATH, 'utf8'));

    console.log(doc);
    const repositoryNames = Object.keys(doc.versions);

    repositoryNames.forEach((repositoryName) => {
        console.dir(repositoryName);
    });

    const inputs = getActionInputs([
      { name: "github_token", options: { required: true } }
    ]);
    
    const tagsPromises = repositoryNames.map(async (repositoryName) => {
        const { data: tags } = await github.getOctokit(inputs.github_token).rest.repos.listTags({
            owner: github.context.payload.repository.owner.login,
            repo: repositoryName,
        });

        // remove invalid semver tags
        const validTags = tags.filter((tag) => semver.valid(tag.name));

        // Sort the tags by version number and return the tag with the highest version number
        return validTags.sort((a, b) => semver.rcompare(a.name, b.name))[0];
    });

    const tags = await Promise.all(tagsPromises);

    tags.forEach((tag, index) => {
        doc.versions[repositoryNames[index]].value = tag.name;
        core.info(`Tag with highest version number for repository ${repositoryNames[index]}: ${tag.name}`);
    });

    console.log(doc)
    fs.writeFileSync(QA_VERSIONS_PATH, yaml.dump(doc));

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
