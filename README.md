# Prace.js

Pull Request Automated Convention Enforcer

<p align="center"> 
<img src="media/prace-logo.png" width="250"  height="250">
<!--img src="https://raw.githubusercontent.com/innerspacetrainings/Prace.js/master/media/prace-logo.png" width="250"  height="250"-->
</p>

A GitHub action that checks if a PR complies with a given configuration
Checks that the PR title complies with a given regular expression.

[![CodeFactor](https://www.codefactor.io/repository/github/innerspacetrainings/prace.js/badge?s=ae50225ee71c7357c4a6f7a48998b11f34683662)](https://www.codefactor.io/repository/github/innerspacetrainings/prace.js) 
[![CircleCI](https://circleci.com/gh/innerspacetrainings/Prace.js.svg?style=svg&circle-token=b65ff8f34c4b5bfd19e6a3ab17b3ece352e25b73)](https://circleci.com/gh/innerspacetrainings/Prace.js)

# Repository configuration

## Usage

Add `.github/workflows/prace.yml` with the following:

```yml
name: Prace
on:
  pull_request:
    types: ['opened', 'edited', 'reopened', 'synchronize']

jobs:
  prace:
    runs-on: ubuntu-latest
    steps:
      - uses: innerspacetrainings/Prace.js@master
        with:
          configuration-path: .github/prace.yml
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Configuration file

Configure Prace by creating a `.github/prace.yml` file.

Example file:

```yml
version: 1
title:
  patterns:
    - '\[XX-\d*\]\s[\w\s]*'
    - RELEASE\s\w*
  error: 'You have to include [XX-123] or RELEASE into your title'
body:
  patterns:
    - '[\w\s]*'
  error: The body can not be empty
branch:
  patterns:
    - 'feat/[\w\s]**'
  error: Branch must be called `feat/name`
reviewers:
  minimum: 1
  users:
    - Bullrich
  teams:
    - backend
additions: 256
labels:
  - bug
  - enhancement
```

You can use the [config generator](https://innerspacetrainings.github.io/Prace.js/) instead of manually generating the file.

## Configuration properties

All of the configuration fields are optional, they can be removed and that particular check won't be done. 
(An empty file will make all checks to be approved).

### Title, body and branch
- patterns `string[]`: The regex patterns against the attributes will be evaluated.
- error `string`: The error to be displayed in case that the regex expression failed.

In the case of having more than one pattern, the property will be evaluated to all of them to see if it complies with 
**at least one pattern**. It doesn't need to comply with all of the patterns, just one.

### Reviewers
- minimum `number`: The minimum amount of reviewers to have in the Pull Request.
- users `string[]`: A list of required users. It requires **at least one** of the users in the array.
- teams `string[]`: A list of required teams. It requires **at least one** of the users in the array. Can be the name or the slug.

These fields are not case sensitive.

### Additions `number`

The max number of LOC added in the Pull Request.

### Labels `string[]`
The labels required in the Pull Request. It requires **at least one** of the given labels to be in the Pull Request.

This field is not case sensitive.

---
Happy hacking ❤
