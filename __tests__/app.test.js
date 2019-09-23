'use strict'

const nock = require('nock')
const { GitHubRepos } = require('../index')
const mockReposList = require('./fixtures/repos-list.json')

describe('Update repository settings', () => {
  beforeEach(() => {
    nock.cleanAll()
  })

  test('should be able to disable issues for all repos that have issues enabled', async () => {
    const GITHUB_API_URL = 'https://api.github.com'

    nock(GITHUB_API_URL)
      .patch(/\/repos\/lirantal\/.*/, {
        has_issues: false
      })
      .times(2)
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

  test('should be able to update wiki and projects features for all repos that have them disabled', async () => {
    const GITHUB_API_URL = 'https://api.github.com'

    nock(GITHUB_API_URL)
      .patch(/\/repos\/lirantal\/.*/, {
        has_wiki: false
      })
      .reply(200)

    nock(GITHUB_API_URL)
      .patch(/\/repos\/lirantal\/.*/, {
        has_projects: false
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
        wiki: 'off',
        projects: 'off'
      }
    }

    const result = await githubRepos.update(requestOptions)
    expect(result).toMatchObject({
      itemsChangedDetails: [
        {
          wiki: 'off',
          owner: 'lirantal',
          repo: 'thinky'
        }
      ],
      itemsChangedTotal: 1
    })

    expect(result.reposList.length).toBeTruthy()
  })

  test('should not actually update repository settings if passed a dryRun flag', async () => {
    const GITHUB_API_URL = 'https://api.github.com'

    const outgoingRequest = nock(GITHUB_API_URL)
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
      },
      dryRun: true
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

    // assert the actual request to actually run an
    // update was not sent since we're in dry-run mode
    expect(outgoingRequest.isDone()).toBe(false)
  })
})

describe('Get repositories', () => {
  test('should be able to get repos list by a regex filter', async () => {
    const GITHUB_API_URL = 'https://api.github.com'

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
      nameFilter: 'typeform'
    }

    const result = await githubRepos.getAll(requestOptions)
    expect(result[0].name).toMatch('typeform')
    expect(result[1].name).toMatch('typeform')
    expect(result.length).toBe(2)
  })

  test('should be able to get all repos when no filter is provided', async () => {
    const GITHUB_API_URL = 'https://api.github.com'

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
      }
    }

    const result = await githubRepos.getAll(requestOptions)
    expect(result.length).toBe(3)
  })
})
