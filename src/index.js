const github = require("@actions/github");
const core = require("@actions/core");
const semver = require("semver");
const fs = require('fs');
const yaml = require('js-yaml');

async function run() {


    const doc = yaml.load(fs.readFileSync( './environments/qa/versions.yaml', 'utf8'));

    console.log(doc);

    const repositoryNames = Object.keys(doc.versions).map((key) => key.replaceAll("_", "-"));

    repositoryNames.forEach((repositoryName) => {
        console.dir(repositoryName);
    });

    const inputs = getActionInputs([
      { name: "github_token", options: { required: true } }
    ]);

    // Fetch the list of tags for each repository
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

    // Wait for all promises to resolve and store the results in an array
    const tags = await Promise.all(tagsPromises);

    // Print the tag with the highest version number for each repository
    tags.forEach((tag, index) => {
        core.info(`Tag with highest version number for repository ${repositoryNames[index]}: ${tag.name}`);
    });
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
