'use strict'

const Octokit = require('@octokit/rest')
const debug = require('debug')('githubrepos-api')

module.exports = class GitHubRepos {
  constructor (config) {
    const octokit = new Octokit({
      auth: config.githubToken
    })

    this.octokit = octokit
  }

  async updateRepoIssues (status, {repoItem}) {
    const owner = repoItem.owner.login

    if (
      (status === 'on' && repoItem.has_issues === false) ||
      (status === 'off' && repoItem.has_issues === true)
    ) {
      debug(`Setting repository [${repoItem.name}] issues: [${status}]`)

      await this.octokit.repos.update({
        owner,
        repo: repoItem.name,
        has_issues: status === 'on'
      })

      return {
        owner,
        repo: repoItem.name,
        issues: status
      }
    }

    debug(`No update required for: [${repoItem.name}]`)
    return null
  }

  async update ({repoFilter, features}) {
    const options = await this.octokit.repos.list.endpoint.merge({
      type: repoFilter.type,
      sort: 'full_name',
      per_page: '100'
    })

    const itemsChangedDetails = []
    let itemsChangedTotal = 0
    let reposList = []

    for await (const response of this.octokit.paginate.iterator(options)) {
      reposList = reposList.concat(response.data)

      for (const repoItem of response.data) {
        if (features.issues) {
          const itemChanged = await this.updateRepoIssues(features.issues, {repoItem})
          if (itemChanged) {
            itemsChangedDetails.push(itemChanged)
            itemsChangedTotal++
          }
        }
      }
    }

    return {
      itemsChangedTotal,
      reposList,
      itemsChangedDetails
    }
  }
}
