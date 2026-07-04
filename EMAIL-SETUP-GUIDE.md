# Email Setup Guide for GitHub Actions

## Error: "530-5.7.0 Authentication Required"

This error means Gmail authentication is failing. Follow these steps to fix it.

## Step-by-Step Setup

### 1. Enable 2-Factor Authentication on Gmail

1. Go to: https://myaccount.google.com/security
2. Click **2-Step Verification**
3. Follow the prompts to enable 2FA
4. **Important:** You MUST have 2FA enabled to create App Passwords

### 2. Generate Gmail App Password

1. Go to: https://myaccount.google.com/apppasswords
   - Or: Google Account → Security → 2-Step Verification → App passwords
2. Click **Select app** → Choose "Mail"
3. Click **Select device** → Choose "Other (Custom name)"
4. Enter name: "GitHub Actions"
5. Click **Generate**
6. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)
7. **Important:** Remove spaces when using it

### 3. Add GitHub Secrets

Go to your repository: `https://github.com/YOUR_USERNAME/k8s-cicd-demo/settings/secrets/actions`

Add these secrets:

#### EMAIL
- **Name:** `EMAIL`
- **Value:** Your Gmail address (e.g., `ashwanidevops@gmail.com`)

#### EMAIL_PASSWORD
- **Name:** `EMAIL_PASSWORD`
- **Value:** The 16-character App Password (without spaces)
- **Example:** `abcdefghijklmnop` (NOT `abcd efgh ijkl mnop`)

### 4. Verify Secrets

Check that secrets are set:
1. Go to: Repository → Settings → Secrets and variables → Actions
2. You should see:
   - ✅ EMAIL
   - ✅ EMAIL_PASSWORD
   - ✅ DOCKER_PASSWORD
   - ✅ KUBECONFIG

## Common Issues

### Issue 1: "Authentication Required"

**Cause:** EMAIL or EMAIL_PASSWORD secret is missing or incorrect

**Solution:**
1. Verify EMAIL secret contains your Gmail address
2. Verify EMAIL_PASSWORD contains the App Password (no spaces)
3. Generate a new App Password if needed
4. Update the EMAIL_PASSWORD secret

### Issue 2: "Invalid credentials"

**Cause:** App Password is incorrect or has spaces

**Solution:**
1. Copy App Password again
2. Remove ALL spaces
3. Update EMAIL_PASSWORD secret
4. Example: `abcd efgh ijkl mnop` → `abcdefghijklmnop`

### Issue 3: "Less secure app access"

**Cause:** Trying to use regular Gmail password

**Solution:**
- ❌ Don't use your regular Gmail password
- ✅ Use App Password (requires 2FA)
- Generate App Password as described above

### Issue 4: "App Passwords not available"

**Cause:** 2-Factor Authentication not enabled

**Solution:**
1. Enable 2FA on your Google Account
2. Wait a few minutes
3. Try generating App Password again

## Testing Email Configuration

### Test Locally:

```bash
# Test SMTP connection
curl -v --url 'smtp://smtp.gmail.com:587' \
  --mail-from 'your-email@gmail.com' \
  --mail-rcpt 'your-email@gmail.com' \
  --user 'your-email@gmail.com:your-app-password' \
  --upload-file - <<EOF
From: your-email@gmail.com
To: your-email@gmail.com
Subject: Test Email

This is a test email.
EOF
```

### Test in GitHub Actions:

1. Push a commit to trigger the workflow
2. Check Actions tab for errors
3. If authentication fails, regenerate App Password

## Security Best Practices

### ✅ DO:
- Use App Passwords (not regular password)
- Enable 2-Factor Authentication
- Store passwords in GitHub Secrets
- Regenerate App Passwords periodically
- Delete unused App Passwords

### ❌ DON'T:
- Share App Passwords
- Commit passwords to repository
- Use regular Gmail password
- Disable 2FA after creating App Password

## Alternative: Use Different Email Service

If Gmail doesn't work, you can use other SMTP services:

### SendGrid:
```json
{
  "email": {
    "smtp_server": "smtp.sendgrid.net",
    "smtp_port": 587
  }
}
```

### Mailgun:
```json
{
  "email": {
    "smtp_server": "smtp.mailgun.org",
    "smtp_port": 587
  }
}
```

### AWS SES:
```json
{
  "email": {
    "smtp_server": "email-smtp.us-east-1.amazonaws.com",
    "smtp_port": 587
  }
}
```

## Verification Checklist

Before running the workflow, verify:

- [ ] 2FA enabled on Gmail
- [ ] App Password generated
- [ ] EMAIL secret set in GitHub
- [ ] EMAIL_PASSWORD secret set in GitHub (no spaces)
- [ ] Secrets are in the correct repository
- [ ] Email address in config/values.json matches

## Quick Fix Commands

### Check if secrets are set:
```bash
# Go to: https://github.com/YOUR_USERNAME/k8s-cicd-demo/settings/secrets/actions
# You should see EMAIL and EMAIL_PASSWORD listed
```

### Update config/values.json:
```bash
cd k8s-cicd-demo
nano config/values.json
# Verify "notification_email": "ashwanidevops@gmail.com"
```

### Re-run workflow:
```bash
git commit --allow-empty -m "Test email configuration"
git push
```

## Support Links

- Gmail App Passwords: https://support.google.com/accounts/answer/185833
- 2-Step Verification: https://support.google.com/accounts/answer/185839
- GitHub Secrets: https://docs.github.com/en/actions/security-guides/encrypted-secrets

## Summary

1. ✅ Enable 2FA on Gmail
2. ✅ Generate App Password
3. ✅ Add EMAIL secret (your Gmail address)
4. ✅ Add EMAIL_PASSWORD secret (App Password without spaces)
5. ✅ Push code to trigger workflow
6. ✅ Check email for approval request

Once configured correctly, you'll receive email notifications for all deployments!