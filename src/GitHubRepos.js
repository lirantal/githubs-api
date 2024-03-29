/* eslint-disable security/detect-object-injection */
'use strict'

const Octokit = require('@octokit/rest')
const debug = require('debug')('githubrepos-api')

module.exports = class GitHubRepos {
  constructor(config) {
    const octokit = new Octokit({
      auth: config.githubToken
    })

    this.octokit = octokit
  }

  async updateRepoFeatures(features, { repoItem, dryRun }) {
    const owner = repoItem.owner.login

    for (const feature in features) {
      const status = features[feature]

      if (
        (status === 'on' && repoItem[`has_${feature}`] === false) ||
        (status === 'off' && repoItem[`has_${feature}`] === true)
      ) {
        debug(`Setting repository [${repoItem.name}] ${feature}: [${status}]`)

        if (dryRun !== true) {
          await this.octokit.repos.update({
            owner,
            repo: repoItem.name,
            [`has_${feature}`]: status === 'on'
          })
        }

        return {
          owner,
          repo: repoItem.name,
          [feature]: status
        }
      }
    }

    debug(`No update required for: [${repoItem.name}]`)
    return null
  }

  async getAll({ repoFilter, nameFilter }) {
    let reposList = []

    const options = await this.octokit.repos.list.endpoint.merge({
      type: repoFilter.type,
      sort: 'full_name',
      per_page: '100'
    })

    for await (const response of this.octokit.paginate.iterator(options)) {
      if (nameFilter) {
        let repos = []
        for (const repo of response.data) {
          if (repo.name.match(nameFilter)) {
            repos = repos.concat(repo)
          }
        }

        reposList = reposList.concat(repos)
      } else {
        reposList = reposList.concat(response.data)
      }
    }

    return reposList
  }

  async update({ repoFilter, features, dryRun }) {
    if (dryRun === true) {
      debug(`Detected dry-run mode, will not actually modify repository settings`)
    }

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
        const itemChanged = await this.updateRepoFeatures(features, {
          repoItem,
          dryRun
        })
        if (itemChanged) {
          itemsChangedDetails.push(itemChanged)
          itemsChangedTotal++
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
