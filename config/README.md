# Configuration Management

This directory contains centralized configuration for the entire CI/CD pipeline.

## values.json

All configuration values are stored in `values.json` and automatically loaded by the GitHub Actions workflow.

### Configuration Structure

```json
{
  "project": {
    "name": "Project name",
    "description": "Project description"
  },
  "docker": {
    "username": "Docker Hub username",
    "image_name": "Docker image name",
    "platforms": "Build platforms (e.g., linux/amd64,linux/arm64)"
  },
  "kubernetes": {
    "namespace": "Application namespace",
    "monitoring_namespace": "Monitoring namespace",
    "replicas": "Number of replicas"
  },
  "email": {
    "notification_email": "Email for notifications",
    "smtp_server": "SMTP server address",
    "smtp_port": "SMTP port",
    "from_name": "Sender name"
  },
  "monitoring": {
    "prometheus_port": "Prometheus NodePort",
    "grafana_port": "Grafana NodePort",
    "grafana_default_user": "Grafana username",
    "grafana_default_password": "Grafana password"
  },
  "application": {
    "port": "Application container port",
    "nodeport": "Application NodePort",
    "health_check_path": "Health check endpoint"
  }
}
```

## How It Works

### 1. Configuration Loading

The GitHub Actions workflow has a dedicated `load-config` job that:
- Reads `config/values.json`
- Parses JSON using `jq`
- Exports values as job outputs
- Makes values available to all subsequent jobs

### 2. Using Configuration Values

All jobs that need configuration values must:
1. Add `load-config` to their `needs` array
2. Reference values using: `${{ needs.load-config.outputs.variable_name }}`

Example:
```yaml
jobs:
  my-job:
    needs: [load-config]
    steps:
      - name: Use config value
        run: echo "Email: ${{ needs.load-config.outputs.notification_email }}"
```

### 3. Available Variables

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `docker_username` | Docker Hub username | ashwani786 |
| `docker_image` | Full Docker image name | ashwani786/k8s-cicd-demo |
| `platforms` | Docker build platforms | linux/amd64,linux/arm64 |
| `k8s_namespace` | Kubernetes namespace | production |
| `monitoring_namespace` | Monitoring namespace | monitoring |
| `notification_email` | Email for notifications | ashwanidevops@gmail.com |
| `smtp_server` | SMTP server | smtp.gmail.com |
| `smtp_port` | SMTP port | 587 |
| `from_name` | Email sender name | DevOps CI/CD |

## Updating Configuration

### To Change Email Address:

```json
{
  "email": {
    "notification_email": "newemail@example.com"
  }
}
```

### To Change Docker Username:

```json
{
  "docker": {
    "username": "newusername"
  }
}
```

### To Change Kubernetes Namespace:

```json
{
  "kubernetes": {
    "namespace": "staging"
  }
}
```

### To Add New Platforms:

```json
{
  "docker": {
    "platforms": "linux/amd64,linux/arm64,linux/arm/v7"
  }
}
```

## Benefits

### ✅ Centralized Configuration
- Single source of truth
- Easy to update
- No hardcoded values in workflow

### ✅ Environment-Specific Configs
- Can create `values-dev.json`, `values-prod.json`
- Switch based on branch or environment

### ✅ Version Control
- Configuration changes tracked in Git
- Easy to review and rollback

### ✅ Maintainability
- Update once, applies everywhere
- Reduces errors from manual updates

## Advanced Usage

### Multiple Environments

Create environment-specific config files:

```bash
config/
├── values.json           # Default/Production
├── values-dev.json       # Development
├── values-staging.json   # Staging
└── README.md
```

Update workflow to load based on branch:

```yaml
- name: Load configuration
  id: config
  run: |
    if [ "${{ github.ref }}" == "refs/heads/dev" ]; then
      CONFIG_FILE="config/values-dev.json"
    elif [ "${{ github.ref }}" == "refs/heads/staging" ]; then
      CONFIG_FILE="config/values-staging.json"
    else
      CONFIG_FILE="config/values.json"
    fi
    echo "docker_username=$(jq -r '.docker.username' $CONFIG_FILE)" >> $GITHUB_OUTPUT
```

### Validation

Add validation step to ensure config is valid:

```yaml
- name: Validate configuration
  run: |
    jq empty config/values.json || exit 1
    echo "✅ Configuration is valid JSON"
```

### Secrets vs Config

**Use Config File For:**
- Non-sensitive values
- Public information
- Environment settings
- Port numbers
- Namespaces

**Use GitHub Secrets For:**
- Passwords
- API tokens
- Private keys
- Sensitive credentials

## Example Workflow Integration

```yaml
jobs:
  load-config:
    runs-on: ubuntu-latest
    outputs:
      notification_email: ${{ steps.config.outputs.notification_email }}
    steps:
      - uses: actions/checkout@v3
      - id: config
        run: |
          echo "notification_email=$(jq -r '.email.notification_email' config/values.json)" >> $GITHUB_OUTPUT

  send-email:
    needs: [load-config]
    runs-on: ubuntu-latest
    steps:
      - name: Send notification
        run: |
          echo "Sending to: ${{ needs.load-config.outputs.notification_email }}"
```

## Troubleshooting

### Issue: Config not loading

**Solution:**
- Ensure `values.json` is valid JSON
- Check file path is correct
- Verify `jq` is installed (pre-installed on GitHub runners)

### Issue: Variable not found

**Solution:**
- Check variable name matches JSON path
- Ensure job has `load-config` in `needs` array
- Verify output name matches in both jobs

### Issue: Value is empty

**Solution:**
- Check JSON structure
- Ensure `jq` query is correct
- Verify file is committed to repository

## Best Practices

1. **Always validate JSON** before committing
2. **Document all changes** in commit messages
3. **Test in dev environment** before production
4. **Keep secrets separate** from config
5. **Use meaningful names** for variables
6. **Add comments** for complex configurations

## Summary

The `values.json` file provides:
- ✅ Single source of truth for all configuration
- ✅ Easy updates without modifying workflow
- ✅ Version-controlled configuration
- ✅ Environment-specific settings
- ✅ Reduced maintenance overhead

Update `values.json` to change any configuration value across the entire pipeline!