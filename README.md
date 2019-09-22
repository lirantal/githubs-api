<p align="center"><h1 align="center">
  githubs-api
</h1>

<p align="center">
  Manage GitHub repositories in bulk
</p>

<p align="center">
  <a href="https://www.npmjs.org/package/githubs-api"><img src="https://badgen.net/npm/v/githubs-api" alt="npm version"/></a>
  <a href="https://www.npmjs.org/package/githubs-api"><img src="https://badgen.net/npm/license/githubs-api" alt="license"/></a>
  <a href="https://www.npmjs.org/package/githubs-api"><img src="https://badgen.net/npm/dt/githubs-api" alt="downloads"/></a>
  <a href="https://travis-ci.org/lirantal/githubs-api"><img src="https://badgen.net/travis/lirantal/githubs-api" alt="build"/></a>
  <a href="https://codecov.io/gh/lirantal/githubs-api"><img src="https://badgen.net/codecov/c/github/lirantal/githubs-api" alt="codecov"/></a>
  <a href="https://snyk.io/test/github/lirantal/githubs-api"><img src="https://snyk.io/test/github/lirantal/githubs-api/badge.svg" alt="Known Vulnerabilities"/></a>
  <a href="./SECURITY.md"><img src="https://img.shields.io/badge/Security-Responsible%20Disclosure-yellow.svg" alt="Responsible Disclosure Policy" /></a>
</p>

# About

Manage GitHub repositories in bulk

# Install

```bash
npm install --save githubs-api
```

# Usage

```js
const {GitHubRepos} = require('githubs-api')

// instantiate using a github token
const githubRepos = new GitHubRepos({
  githubtoken: 'abc'
})

// update repos in bulk based on settings
// specified in requestOptions
await githubRepos.update(requestOptions)
```

# Example

```js
const {GitHubRepos} = require('githubs-api')

// provide a personal developer access token
// obtained from the GitHub Developer Settings
// page at: https://github.com/settings/tokens
const githubRepos = new GitHubRepos({
  githubtoken: 'abc'
})

// this will update all github repositories owned by
// your user (as provided in the token) and set all
// of them to remove the issues tab from the project
// page
const requestOptions = {
  repoFilter: {
    type: 'owner'
  },
  features: {
    issues: 'off'
  }
}

const result = await githubRepos.update(requestOptions)
```

# Contributing

Please consult [CONTIRBUTING](./CONTRIBUTING.md) for guidelines on contributing to this project.

# Author

**githubs-api** © [Liran Tal](https://github.com/lirantal), Released under the [Apache-2.0](./LICENSE) License.
