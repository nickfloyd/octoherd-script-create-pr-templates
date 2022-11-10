// @ts-check

/**
 * Creates PRs to add issue templates across repositories
 *
 * @param {import('@octoherd/cli').Octokit} octokit
 * @param {import('@octoherd/cli').Repository} repository
 * @param {object} options
 * @param {string} options.repos Comma separated list of repos to create pull requests to add the PR templates (one or many)
 * @param {string} options.templateDirectory The location of the template directory on a local instance
 */
export async function script(
  octokit,
  repository,
  { repos, templateDirectory }
) {}
