# Update version yaml file

Action to update a version yaml file with the latest tagged semantic version of the repository.

## Workflow Action

### All input options

| Input                                   | Description                                     | Default | Required |
|-----------------------------------------|-------------------------------------------------|---------|----------|
| [github_token](#github_token)           | Github API token                                |         | Yes      |
| [version_file_path](#version_file_path) | Relative path to the version.yml file to update |     | Yes       |


### Detailed inputs

#### github_token

Required to make API requests to get the latest tag for each repository. Pass using secrets.GITHUB_TOKEN.

#### version_file_path

Relative path to the version yaml file to be updated with the latest tags.

Example version.yaml file:

```yaml 
versions:
  hocs-audit: 2.18.3
  hocs-case-creator: 1.13.0
  hocs-casework: 3.17.0
  hocs-docs: 3.6.7
  hocs-docs-converter: 1.7.4
  hocs-frontend: 2.28.10
  hocs-info-service: 3.3.20
  hocs-management-ui: 2.2.15
  hocs-notify: 1.5.5
  hocs-outbound-proxy: 1.5.1
  hocs-queue-tool: 3.1.0
  hocs-search: 3.0.3
  hocs-templates: 1.8.4
  hocs-toolbox: 1.4.1
  hocs-workflow: 2.23.6
```

### Usage

This action can be triggered on any event but is intended to be run manually on demand.

#### Create a Pull Request on a repository with an updated version file

```yaml
name: 'Update QA Versions'
on:
  workflow_dispatch:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  VERSION_FILE_PATH: './environments/qa/versions.yaml'

jobs:
  update:
    name: 'Update versions'
    runs-on: ubuntu-latest
    steps:

      - name: Set PR data
        run: |
          echo "PR_BRANCH=update_qa" >> ${GITHUB_ENV}
          echo "PR_TITLE=Update QA environment $(date +%d-%m-%Y)" >> ${GITHUB_ENV}
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Configure git
        run: |
          git config user.name "$GITHUB_ACTOR"
          git config user.email "$GITHUB_ACTOR@users.noreply.github.com"
        shell: bash

      - name: Create a branch
        run: git checkout -b $PR_BRANCH
        shell: bash

      - name: Run update action
        uses: UKHomeOffice/update-helmfile-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          version_file_path: ${{ env.VERSION_FILE_PATH }}

      - name: Add all files
        run: |
          git add --all
          git commit -m "$PR_TITLE"
          git push --set-upstream origin $PR_BRANCH --force
        shell: bash

      - name: Create a PR
        run: gh pr edit $PR_BRANCH --title "$PR_TITLE" && gh pr reopen $PR_BRANCH || gh pr create --fill -B main -H $PR_BRANCH
        shell: bash
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

```

### Generating dist/index.js

We use [ncc](https://github.com/vercel/ncc) to package the action into an executable file.
This removes the need to either check in the node_modules folder or build the action prior to using.

We need to ensure that the dist folder is updated whenever there is a functionality change, otherwise we won't be running the correct version within jobs that use this action.

Before checking creating your Pull Request you should ensure that you have built this file by running `npm run build` within the root directory.

A blocking workflow called [check-dist](.github/workflows/check-dist.yml) is enabled that checks this dist folder for changes happens at both push to main and on pull request events.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.