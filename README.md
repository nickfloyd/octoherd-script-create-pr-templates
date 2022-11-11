# octoherd-script-create-pr-templates

> Creates PRs to add issue templates across repositories

[![@latest](https://img.shields.io/npm/v/octoherd-script-create-pr-templates.svg)](https://www.npmjs.com/package/octoherd-script-create-pr-templates)
[![Build Status](https://github.com/nickfloyd/octoherd-script-create-pr-templates/workflows/Test/badge.svg)](https://github.com/nickfloyd/octoherd-script-create-pr-templates/actions?query=workflow%3ATest+branch%3Amain)

## Usage

Create a `pull_request_template.md` with your own PR template content. Then run the following using the `--templateDirectory` parameter to source your local template file(s).

Minimal usage

```js
npx octoherd-script-create-pr-templates \
  --octoherd-repos nickfloyd/octokat octokit/octokit.net \
  --templateDirectory $(pwd)/templates
```

Pass all options as CLI flags to avoid user prompts

```js
npx octoherd-script-create-pr-templates \
  -T ghp_0123456789abcdefghjklmnopqrstuvwxyzA \
  -R "nickfloyd/*" \
  --octoherd-repos nickfloyd/octokat octokit/octokit.net \
  --templateDirectory $(pwd)/templates
```

NOTE: This script assumes the standard "hidden" directory structure in the target repo(s) - i.e. .github/ as defined [here](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository)

## Options

| option                       | type             | description                                                                                                                                                                                                                                 |
| ---------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--template-directory`       | string           | **Required.** The location of the template directory on a local instance                                                                                                                                                                    |
| `--label-name`       | string           | **Optional.** The name of the label that should be added to the PR instance                                                                                                                                                                    |
| `--octoherd-token`, `-T`     | string           | A personal access token ([create](https://github.com/settings/tokens/new?scopes=repo)). Script will create one if option is not set                                                                                                         |
| `--octoherd-repos`, `-R`     | array of strings | One or multiple space-separated repositories in the form of `repo-owner/repo-name`. `repo-owner/*` will find all repositories for one owner. `*` will find all repositories the user has access to. Will prompt for repositories if not set |
| `--octoherd-bypass-confirms` | boolean          | Bypass prompts to confirm mutating requests                                                                                                                                                                                                 |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## About Octoherd

[@octoherd](https://github.com/octoherd/) is project to help you keep your GitHub repositories in line.

## License

[ISC](LICENSE.md)
