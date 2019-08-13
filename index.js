const Octokit = require('@octokit/rest')
const octokit = new Octokit()

// Compare: https://developer.github.com/v3/repos/#list-organization-repositories
octokit.repos.listForOrg({
    org: 'octokit',
    type: 'public'
}).then(({ data }) => {
    // handle data
})