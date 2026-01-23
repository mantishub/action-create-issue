# Create MantisHub Issue Action

A GitHub Action to create issues in [MantisHub](https://www.mantishub.com) directly from your workflows. Automate issue creation for build failures, release follow-ups, scheduled maintenance tasks, and more.

## Overview

This action integrates GitHub Actions with MantisHub's REST API, enabling you to programmatically create issues in your MantisHub projects. Common use cases include:

- **Build Monitoring**: Automatically create issues when CI/CD pipelines fail
- **Release Management**: Generate follow-up tasks after deploying a new version
- **Scheduled Workflows**: Create recurring maintenance or review tasks
- **Cross-Platform Integration**: Bridge GitHub events with MantisHub issue tracking

## Prerequisites

Before using this action, ensure you have:

1. A [MantisHub](https://www.mantishub.com) account with an active project
2. An API token with permissions to create issues (see [Obtaining Your API Key](#obtaining-your-api-key))
3. The API token stored as a [GitHub repository secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

## Quick Start

Add the following step to your GitHub Actions workflow:

```yaml
- name: Create MantisHub Issue
  uses: mantishub/action-create-issue@v1
  with:
    url: https://your-instance.mantishub.io
    api-key: ${{ secrets.MANTISHUB_API_KEY }}
    project: 'MyProject'
    summary: 'Issue summary'
    description: 'Detailed description of the issue'
    category: 'General'
```

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| `url` | Yes | Base URL of your MantisHub instance (e.g., `https://example.mantishub.io`) |
| `api-key` | Yes | API token for authentication. **Always use a secret** - never hardcode this value |
| `project` | Yes | Name of the target project in MantisHub (case-sensitive) |
| `summary` | Yes | Brief title/summary of the issue |
| `description` | Yes | Detailed description of the issue. Supports multi-line text |
| `category` | Yes | Category for the issue (must match an existing category in your project) |

## Outputs

| Output | Description |
|--------|-------------|
| `issue-id` | The numeric ID of the newly created issue. Use this to reference the issue in subsequent workflow steps |

## Usage Examples

### Basic Usage

Create an issue with minimal configuration:

```yaml
name: Create Issue

on:
  workflow_dispatch:

jobs:
  create-issue:
    runs-on: ubuntu-latest
    steps:
      - name: Create MantisHub Issue
        uses: mantishub/action-create-issue@v1
        with:
          url: https://example.mantishub.io
          api-key: ${{ secrets.MANTISHUB_API_KEY }}
          project: 'MyProject'
          summary: 'New issue from GitHub Actions'
          description: 'This issue was created automatically.'
          category: 'General'
```

### Create Issue on Build Failure

Automatically create an issue when your build fails:

```yaml
name: Build and Report

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build project
        id: build
        run: npm run build
        continue-on-error: true

      - name: Report build failure
        if: steps.build.outcome == 'failure'
        uses: mantishub/action-create-issue@v1
        with:
          url: https://example.mantishub.io
          api-key: ${{ secrets.MANTISHUB_API_KEY }}
          project: 'MyProject'
          summary: 'Build failed on ${{ github.ref_name }}'
          description: |
            ## Build Failure Report

            **Repository:** ${{ github.repository }}
            **Branch:** ${{ github.ref_name }}
            **Commit:** ${{ github.sha }}
            **Triggered by:** ${{ github.actor }}

            [View workflow run](${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }})
          category: 'Build'
```

### Post-Release Follow-up Tasks

Create follow-up tasks after publishing a release:

```yaml
name: Release Workflow

on:
  release:
    types: [published]

jobs:
  post-release:
    runs-on: ubuntu-latest
    steps:
      - name: Create release follow-up issue
        uses: mantishub/action-create-issue@v1
        with:
          url: https://example.mantishub.io
          api-key: ${{ secrets.MANTISHUB_API_KEY }}
          project: 'MyProject'
          summary: 'Post-release tasks for ${{ github.event.release.tag_name }}'
          description: |
            ## Release Follow-up Checklist

            Version **${{ github.event.release.tag_name }}** has been published.

            **Tasks to complete:**
            - [ ] Update documentation
            - [ ] Notify stakeholders
            - [ ] Monitor error tracking for issues
            - [ ] Update changelog on website

            [Release notes](${{ github.event.release.html_url }})
          category: 'Release'
```

### Using the Issue ID Output

Reference the created issue ID in subsequent steps:

```yaml
name: Create and Reference Issue

on:
  workflow_dispatch:

jobs:
  create-issue:
    runs-on: ubuntu-latest
    steps:
      - name: Create MantisHub Issue
        id: create-issue
        uses: mantishub/action-create-issue@v1
        with:
          url: https://example.mantishub.io
          api-key: ${{ secrets.MANTISHUB_API_KEY }}
          project: 'MyProject'
          summary: 'Automated issue'
          description: 'Created via GitHub Actions'
          category: 'General'

      - name: Display issue information
        run: |
          echo "Created issue ID: ${{ steps.create-issue.outputs.issue-id }}"
          echo "View issue at: https://example.mantishub.io/view.php?id=${{ steps.create-issue.outputs.issue-id }}"
```

### Scheduled Maintenance Reminders

Create recurring maintenance tasks on a schedule:

```yaml
name: Weekly Maintenance Reminder

on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9:00 AM UTC

jobs:
  create-reminder:
    runs-on: ubuntu-latest
    steps:
      - name: Create maintenance task
        uses: mantishub/action-create-issue@v1
        with:
          url: https://example.mantishub.io
          api-key: ${{ secrets.MANTISHUB_API_KEY }}
          project: 'Operations'
          summary: 'Weekly maintenance review - Week ${{ github.run_number }}'
          description: |
            ## Weekly Maintenance Checklist

            **Week of:** ${{ github.event.schedule }}

            - [ ] Review system logs
            - [ ] Check backup status
            - [ ] Update dependencies
            - [ ] Review security alerts
          category: 'Maintenance'
```

## Obtaining Your API Key

To authenticate with the MantisHub API, you need to generate an API token:

1. Log in to your MantisHub instance
2. Navigate to **My Account** (click your username in the top-right corner)
3. Select the **API Tokens** tab
4. Click **Create API Token**
5. Give your token a descriptive name (e.g., "GitHub Actions")
6. Copy the generated token immediately (it won't be shown again)

### Storing the API Key Securely

**Never commit your API key directly in workflow files.** Instead, store it as a GitHub secret:

1. Go to your GitHub repository
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Name it `MANTISHUB_API_KEY` (or your preferred name)
5. Paste your API token as the value
6. Click **Add secret**

Reference the secret in your workflow using `${{ secrets.MANTISHUB_API_KEY }}`.

## Troubleshooting

### Common Issues

**Authentication Failed (401 Error)**
- Verify your API key is correct and hasn't expired
- Ensure the secret name in your workflow matches the one configured in repository settings
- Check that the API token has sufficient permissions

**Project Not Found (404 Error)**
- Verify the project name is spelled correctly (case-sensitive)
- Ensure your API token has access to the specified project

**Category Not Found**
- Category names must match exactly with existing categories in your MantisHub project
- Check available categories in your project settings

**Invalid URL**
- Ensure the URL includes the protocol (`https://`)
- Do not include a trailing slash
- Verify the MantisHub instance is accessible

### Debugging

Enable debug logging in your workflow to see detailed output:

```yaml
- name: Create MantisHub Issue
  uses: mantishub/action-create-issue@v1
  env:
    ACTIONS_STEP_DEBUG: true
  with:
    # ... your inputs
```

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests to the [action-create-issue repository](https://github.com/mantishub/action-create-issue).

## License

This project is provided by [MantisHub](https://www.mantishub.com).
