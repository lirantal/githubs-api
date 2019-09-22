'use strict'

const nock = require('nock')
const {GitHubRepos} = require('../index')
const mockReposList = require('./fixtures/repos-list.json')

describe('Update repository settings', () => {
  test('should be able to disable issues for all repos that have issues enabled', async () => {
    const GITHUB_API_URL = 'https://api.github.com'

    nock(GITHUB_API_URL)
      .persist()
      .patch(/\/repos\/lirantal\/.*/, {
        has_issues: false
      })
      .reply(200)

    nock(GITHUB_API_URL)
      .get('/user/repos')
      .query({
        type: 'owner',
        sort: 'full_name',
        per_page: 100
      })
      .reply(200, mockReposList)

    const githubRepos = new GitHubRepos({
      githubtoken: 'abc'
    })

    const requestOptions = {
      repoFilter: {
        type: 'owner'
      },
      features: {
        issues: 'off'
      }
    }

    const result = await githubRepos.update(requestOptions)
    expect(result).toMatchObject({
      itemsChangedDetails: [
        {
          issues: 'off',
          owner: 'lirantal',
          repo: 'typeform-export-excel'
        },
        {
          issues: 'off',
          owner: 'lirantal',
          repo: 'typeform-client'
        }
      ],
      itemsChangedTotal: 2
    })

    expect(result.reposList.length).toBeTruthy()
  })
})
