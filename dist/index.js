var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as github from '@actions/github';
import * as core from '@actions/core';
import * as semver from 'semver';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const inputs = getActionInputs([
            { name: 'github_token', options: { required: true } },
            { name: 'version_file_path', options: { required: true } },
        ]);
        const doc = yaml.load(fs.readFileSync(inputs.version_file_path, 'utf8'));
        const repositoryNames = Object.keys(doc.versions);
        const tagsPromises = repositoryNames.map((repositoryName) => __awaiter(this, void 0, void 0, function* () {
            const { data: tags } = yield github.getOctokit(inputs.github_token).rest.repos.listTags({
                owner: github.context.payload.repository.owner.login,
                repo: repositoryName,
            });
            return tags.filter((tag) => semver.valid(tag.name)).sort((a, b) => semver.rcompare(a.name, b.name))[0];
        }));
        const tags = yield Promise.all(tagsPromises);
        tags.forEach((tag, index) => {
            doc.versions[repositoryNames[index]] = tag.name;
        });
        fs.writeFileSync(inputs.version_file_path, yaml.dump(doc));
    });
}
const getActionInputs = (variables) => {
    return variables.reduce((obj, variable) => {
        let value = core.getInput(variable.name, variable.options);
        if (!value) {
            if (Object.prototype.hasOwnProperty.call(variable, 'default')) {
                value = variable.default;
            }
        }
        return Object.assign(obj, { [variable.name]: value });
    }, {});
};
run();
