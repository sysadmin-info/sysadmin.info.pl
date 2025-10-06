---
title: How to control test triggers in GitLab for your projects
date: 2024-06-09T06:00:00+00:00
description: How to control test triggers in GitLab for your projects
draft: false 
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- GitLab
categories:
- GitLab
cover:
    image: images/2024-thumbs/gitlab03.webp
---

**Here is a video tutorial**

{{<youtube -De_Tg9R6rA>}}

#### Introduction

There are multiple ways to stop GitLab from automatically starting tests upon any commit in a project. Using conditional variables in the `.gitlab-ci.yml` file to define when tests should be run is one of the easiest methods. Here are some illustrations of how to do this:

##### 1. Using `only` and `except`

You can configure jobs in the `.gitlab-ci.yml` file to run only on specific branches, tags, or commit messages.

Example:

```yaml
test:
  script:
    - echo "Running tests"
  only:
    - master
    - /^release-.*$/
  except:
    - /^hotfix-.*$/
```

In this example, tests will run only in the `master` branch and in all branches starting with `release-`, but not in branches starting with `hotfix-`.

##### 2. Using `rules`

Rules allow for more complex conditional logic in the `.gitlab-ci.yml` file.

Example:

```yaml
test:
  script:
    - echo "Running tests"
  rules:
    - if: '$CI_COMMIT_BRANCH == "master"'
    - if: '$CI_COMMIT_TAG =~ /^v\d+\.\d+\.\d+$/'
```

In this example, tests will run only in the `master` branch or when the commit is tagged with a version pattern (`vX.X.X`).

##### 3. Using an Environment Variable

You can also use an environment variable to decide whether to run tests.

Example:

```yaml
test:
  script:
    - echo "Running tests"
  rules:
    - if: '$RUN_TESTS == "true"'
```

In this case, you need to set the `RUN_TESTS` environment variable to `true` for the tests to run. You can set this variable in the project settings in GitLab or in the commit itself by adding the appropriate variable.

##### 4. Disabling Tests Globally

If you want to disable all tests globally for all commits, you can simply comment out or remove the relevant jobs from the `.gitlab-ci.yml` file.

Example:

```yaml
# test:
#   script:
#     - echo "Running tests"
```

In this way, no tests will run until you uncomment this section.

##### 5. Using `[ci skip]`

You can also add `[ci skip]` or `[skip ci]` to the commit message to skip running CI/CD for that specific commit.

Example commit message:

```
Commit message [ci skip]
```

##### 6. Disabling Specific Runners

If you want to disable specific Runners, you can use tags to decide which Runners should be used to run certain jobs.

Example in the `.gitlab-ci.yml` file:

```yaml
test:
  script:
    - echo "Running tests"
  tags:
    - my-special-runner
```

Then, in the Runner settings in GitLab, make sure the Runner has the appropriate tags assigned.

Choose the solution that best fits your scenario and needs.
