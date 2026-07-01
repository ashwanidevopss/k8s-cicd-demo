# Next Steps for k8s-cicd-demo

## ✅ Files Ready!

All files have been copied to your repository:

```
k8s-cicd-demo/
├── .github/workflows/deploy.yml    ✅ CI/CD Pipeline
├── .gitignore                      ✅ Git ignore file
├── app/
│   ├── Dockerfile                  ✅ Docker build
│   ├── package.json                ✅ Node.js config
│   ├── server.js                   ✅ Application code
│   └── test/server.test.js         ✅ Tests
├── k8s/
│   ├── namespace.yaml              ✅ Production namespace
│   ├── deployment.yaml             ✅ Deployment config
│   └── service.yaml                ✅ Service (NodePort 30100)
└── README.md                       ✅ Documentation
```

---

## 🔐 Step 1: Configure GitHub Secrets

Go to: https://github.com/ashwanidevopss/k8s-cicd-demo/settings/secrets/actions

### Add 3 Secrets:

#### 1. DOCKER_USERNAME
```
Name: DOCKER_USERNAME
Value: ashwanidevopss
```

#### 2. DOCKER_PASSWORD
Get your Docker Hub access token:
1. Go to: https://hub.docker.com/settings/security
2. Click "New Access Token"
3. Name: "GitHub Actions k8s-cicd-demo"
4. Copy the token

```
Name: DOCKER_PASSWORD
Value: <paste-your-docker-hub-token>
```

#### 3. KUBECONFIG
Generate base64 encoded kubeconfig:
```bash
cat ~/.kube/config | base64 | tr -d '\n'
```

Copy the output and add as secret:
```
Name: KUBECONFIG
Value: <paste-base64-encoded-kubeconfig>
```

---

## 🚀 Step 2: Push to GitHub

```bash
cd /Users/ashwani/Documents/devops_project/k8s-cicd-demo

# Check status
git status

# Add all files
git add .

# Commit
git commit -m "Initial commit: Setup CI/CD pipeline for k8s-cicd-demo"

# Push to GitHub
git push origin main
```

---

## 📊 Step 3: Monitor Pipeline

After pushing, the CI/CD pipeline will automatically start:

1. **View in browser:**
   ```
   https://github.com/ashwanidevopss/k8s-cicd-demo/actions
   ```

2. **Pipeline stages:**
   - ✅ Checkout code
   - ✅ Setup Node.js
   - ✅ Install dependencies
   - ✅ Run tests
   - ✅ Build Docker image
   - ✅ Push to Docker Hub
   - ✅ Deploy to Kubernetes
   - ✅ Verify deployment

---

## 🔍 Step 4: Verify Deployment

### Check Kubernetes Resources:

```bash
# Check namespace
kubectl get namespace production

# Check all resources
kubectl get all -n production

# Check deployment
kubectl get deployment k8s-cicd-demo -n production

# Check pods
kubectl get pods -n production -l app=k8s-cicd-demo

# Check service
kubectl get svc k8s-cicd-demo -n production

# View pod logs
kubectl logs -n production -l app=k8s-cicd-demo --tail=50
```

### Access Application:

```bash
# Get node IP
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[0].address}')

# Test endpoints
curl http://$NODE_IP:30100
curl http://$NODE_IP:30100/health
curl http://$NODE_IP:30100/api/info

# Or use port-forward
kubectl port-forward -n production svc/k8s-cicd-demo 8080:80
# Then access: http://localhost:8080
```

---

## 🐳 Step 5: Verify on Docker Hub

Check your Docker Hub repository:
```
https://hub.docker.com/r/ashwanidevopss/k8s-cicd-demo
```

You should see:
- ✅ Repository created
- ✅ Tags: `latest` and commit SHA
- ✅ Last pushed timestamp
- ✅ Image size

---

## 🧪 Step 6: Test CI/CD Pipeline

Make a change to test automatic deployment:

```bash
cd /Users/ashwani/Documents/devops_project/k8s-cicd-demo

# Edit the application
nano app/server.js

# Change line 13:
# From: message: 'Hello from k8s-cicd-demo!',
# To:   message: 'Hello from Kubernetes CI/CD Pipeline!',

# Save and exit (Ctrl+X, Y, Enter)

# Commit and push
git add app/server.js
git commit -m "Update welcome message"
git push origin main
```

### Watch Automatic Deployment:

```bash
# Monitor pipeline on GitHub
open https://github.com/ashwanidevopss/k8s-cicd-demo/actions

# Watch pods update
kubectl get pods -n production -w

# After deployment completes, test:
curl http://$NODE_IP:30100
# Should show: "Hello from Kubernetes CI/CD Pipeline!"
```

---

## 📋 Quick Reference Commands

```bash
# Repository location
cd /Users/ashwani/Documents/devops_project/k8s-cicd-demo

# Check git status
git status

# View logs
kubectl logs -n production -l app=k8s-cicd-demo --tail=50 -f

# Restart deployment
kubectl rollout restart deployment/k8s-cicd-demo -n production

# Scale deployment
kubectl scale deployment/k8s-cicd-demo --replicas=3 -n production

# Check rollout status
kubectl rollout status deployment/k8s-cicd-demo -n production

# Describe deployment
kubectl describe deployment k8s-cicd-demo -n production

# Get events
kubectl get events -n production --sort-by='.lastTimestamp'

# Delete deployment
kubectl delete -f k8s/ -n production
```

---

## 🎯 Your Configuration

| Item | Value |
|------|-------|
| **GitHub Repo** | https://github.com/ashwanidevopss/k8s-cicd-demo |
| **Docker Image** | ashwanidevopss/k8s-cicd-demo:latest |
| **Namespace** | production |
| **Deployment** | k8s-cicd-demo |
| **Service Type** | NodePort |
| **Port** | 30100 |
| **Access URL** | http://NODE-IP:30100 |

---

## 🐛 Troubleshooting

### Pipeline fails at "Push Docker image"
- Verify DOCKER_USERNAME secret is set to: `ashwanidevopss`
- Verify DOCKER_PASSWORD is a valid access token (not password)
- Check token has push permissions

### Pipeline fails at "Deploy to Kubernetes"
- Verify KUBECONFIG secret is base64 encoded
- Test kubeconfig locally: `kubectl get nodes`
- Ensure cluster is accessible

### Pods not starting
```bash
# Check pod status
kubectl describe pod -n production -l app=k8s-cicd-demo

# Check logs
kubectl logs -n production -l app=k8s-cicd-demo

# Check events
kubectl get events -n production
```

### Image pull errors
```bash
# Verify image exists
docker pull ashwanidevopss/k8s-cicd-demo:latest

# Force update
kubectl rollout restart deployment/k8s-cicd-demo -n production
```

---

## ✅ Success Checklist

- [ ] GitHub secrets configured (3 secrets)
- [ ] Files committed and pushed to GitHub
- [ ] Pipeline runs successfully
- [ ] Docker image visible on Docker Hub
- [ ] Kubernetes deployment running
- [ ] Pods are healthy
- [ ] Application accessible at NodePort
- [ ] Test change deployed automatically

---

## 🎉 You're Ready!

**Next:** Configure GitHub secrets and push your code!

```bash
cd /Users/ashwani/Documents/devops_project/k8s-cicd-demo
git add .
git commit -m "Initial commit: Setup CI/CD pipeline"
git push origin main
```

Then watch your application automatically deploy to Kubernetes! 🚀