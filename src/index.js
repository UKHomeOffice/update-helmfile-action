const github = require("@actions/github");
const core = require("@actions/core");
const semver = require("semver");

async function run() {
    const repositoryNames = ["hocs-casework", "hocs-frontend", "hocs-templates", "hocs-info-service", "hocs-docs"];

    const inputs = getActionInputs([
      { name: "github_token", options: { required: true } }
    ]);

    // Fetch the list of tags for each repository
    const tagsPromises = repositoryNames.map(async (repositoryName) => {
        const { data: tags } = await github.getOctokit(inputs.github_token).rest.repos.listTags({
            owner: github.context.payload.repository.owner.login,
            repo: repositoryName,
        });

        core.info(tags[0].name);

        // remove invalid semver tags
        //semver: tag.ref?.replace(/^refs\/tags\//g, ""),
        const validTags = tags.filter((tag) => semver.valid(tag.name));

        core.info(validTags[0].name);
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
