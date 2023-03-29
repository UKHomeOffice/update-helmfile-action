import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { ActionInput, VersionDoc, ServiceDoc, Tag } from './types';
import { getActionInputs, getTagsPromises, updateVersions } from './helpers';

async function run(): Promise<void> {

    // Get the GH token and version file path
    const inputs: ActionInput = getActionInputs([
        { name: 'github_token', options: { required: true } },
        { name: 'version_file_path', options: { required: true } },
        { name: 'service_file_path', options: { required: true } },
    ]);

    // Get the repos to cycle through later
    let services: ServiceDoc = yaml.load(fs.readFileSync(inputs.service_file_path, 'utf8'));
    let doc: VersionDoc = yaml.load(fs.readFileSync(inputs.version_file_path, 'utf8'));
    const repositoryNames: string[] = Object.keys(doc.charts);

    // Get the tags from the GH repos
    const tagsPromises: Promise<Tag>[] = getTagsPromises(repositoryNames, services, inputs);

    // When we have all the tags, build the list for the helmfile doc
    try {
        const tags: Tag[] = await Promise.all(tagsPromises);

        doc = updateVersions(tags, doc, repositoryNames);
        fs.writeFileSync(inputs.version_file_path, yaml.dump(doc));
    } catch (e) {
        console.log('Failed to write version file');
    }
}

run();
