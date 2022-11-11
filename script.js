// @ts-check

import * as fs from 'fs';
import path from 'path';

/**
 * Creates PRs to add pull request templates across repositories
 * See: https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository
 *
 * @param {import('@octoherd/cli').Octokit} octokit
 * @param {import('@octoherd/cli').Repository} repository
 * @param {object} options
 * @param {string} options.templateDirectory The location of the template directory on a local instance
 * @param {string} options.labelName The label you'd like to add to the PR
 */
export async function script(octokit, repository, options) {

  if (!options.templateDirectory) {
    throw new Error("--templateDirectory is required");
  }

  const templateDirectory = options.templateDirectory
  const labelName = options.labelName || "";
  const files = fs.readdirSync(templateDirectory);
  const [repoOwner, repoName] = repository.full_name.split("/");

  // iterate through files and store the string content of each file
  const templates = await Promise.all(
    files.map(async (file) => {
      // read the string content of each file in the templates directory into variable
      const template = await fs.promises.readFile(
        path.join(templateDirectory, file),
        'utf8'
      );
      return {
        name: file,
        content: template,
      };
    })
  );

  // get the Repo to ensure that it's able to receive PRs
  const { data: { archived } } = await octokit.request("GET /repos/{owner}/{repo}", {
    owner: repoOwner,
    repo: repoName,
  }); 

  if (!archived) {

    // get SHA of latest default branch commit
    const { data: { object: { sha } } } = await octokit.request("GET /repos/{owner}/{repo}/git/ref/{ref}", {
      owner: repoOwner,
      repo: repoName,
      ref: `heads/${repository.default_branch}`,
    });

    // come up with branch name based on the current date. remove all spaces, colons, parentheses, and periods
    let branchName = `octoherd/${new Date().toString().replace(/ /g, '-').replace(/:/g, '-').replace(/\(/g, '-').replace(/\)/g, '-').replace(/\./g, '-')}`;

    // only take the first part of branchName before "-GMT"
    branchName = branchName.split('-GMT')[0];

    // lowercase the branchName
    branchName = branchName.toLowerCase();

    octokit.log.info(`sha: ${sha}`)

    // create a branch off of the latest SHA
    const branch = await octokit.request("POST /repos/{owner}/{repo}/git/refs", {
      owner: repository.owner.login,
      repo: repository.name,
      ref: `refs/heads/${branchName}`,
      sha: sha,
    });

    octokit.log.info(`Branch: ${branch}`)

    let existingPRTemplate = {};
    try {
      // check to see if a file in the .github/ directory with the same name already exists
      // This should only ever return one result given it's always looking for pull_request_template.md
      const { data: existingFile } = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
        owner: repository.owner.login,
        repo: repository.name,
        path: '.github/pull_request_template.md',
      });
      existingPRTemplate = existingFile;

      octokit.log.info(`PR templates exist: ${existingFile}`)

    } catch (e) {
      if (e.status !== 404) {
        throw e;
      }
    }

    // if PR templates exist and we would overwrite them, we need to remove those files first
    // so the automation can recreate it

    if (Object.keys(existingPRTemplate).length > 0) {
      for (let j = 0; j < templates.length; j++) {
        if (existingPRTemplate.name === templates[j].name) {
          octokit.log.info(`Deleting existing PR template: ${templates[j].name}`)
          // delete the file
          await octokit.request("DELETE /repos/{owner}/{repo}/contents/{path}", {
            owner: repository.owner.login,
            repo: repository.name,
            path: `.github/${existingPRTemplate.name}`,
            branch: branchName,
            message: `octoherd: delete ${existingPRTemplate.name}`,
            sha: existingPRTemplate.sha,
          });
        }
      }
    }

    // iterate through templates and add each to the branch "octoherd-script-PR"
    for (const template of templates) {
      await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
        owner: repository.owner.login,
        repo: repository.name,
        path: `.github/${template.name}`,
        message: `feat: add ${template.name} PR template`,
        content: Buffer.from(template.content).toString("base64"),
        branch: branch.data.ref,
      });
    }

    // create a PR with a new PR templates
    const { data: pull } = await octokit.request("POST /repos/{owner}/{repo}/pulls", {
      owner: repository.owner.login,
      repo: repository.name,
      title: "Add PR templates",
      body: "This PR adds our standardized PR templates.",
      head: branchName,
      base: repository.default_branch,
    });

    octokit.log.info({ pull: pull.issue_url }, "pull issue url");


    // Add a label to the PR if one was provided
    // i.e. 'Type: Maintenance'
    if(labelName.length > 0) {
      await octokit.request("POST " + pull.issue_url, {
        labels: [
          labelName,
        ]
      });
      octokit.log.info(`Created label named: ${labelName} on PR: ${pull.issue_url}`)
    }
  }
}
