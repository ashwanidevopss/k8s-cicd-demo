# 🚀 Capstone Project Deployment Guide
## k8s-cicd-demo with Monitoring & Email Notifications

## ✅ Project Ready to Deploy!

Your k8s-cicd-demo repository is now configured as a complete capstone project with:
- ✅ CI/CD Pipeline (GitHub Actions)
- ✅ Prometheus & Grafana Monitoring
- ✅ Email Notifications
- ✅ Automatic Rollback
- ✅ Production-ready setup

---

## 📋 Pre-Deployment Checklist

### 1. GitHub Secrets Configuration

Go to: **Settings → Secrets and variables → Actions**

Add these 4 secrets:

| Secret Name | Description | Value |
|------------|-------------|-------|
| `EMAIL` | Gmail address | ashwanidevops@gmail.com |
| `EMAIL_PASSWORD` | Gmail App Password | Generate from Gmail (see below) |
| `DOCKER_USERNAME` | Docker Hub username | ashwani786 |
| `DOCKER_PASSWORD` | Docker Hub token | Get from Docker Hub |
| `KUBECONFIG` | Base64 kubeconfig | `cat ~/.kube/config \| base64 \| tr -d '\n'` |

#### Gmail App Password Setup:
1. Go to: https://myaccount.google.com/security
2. Enable 2-Factor Authentication
3. Go to: App passwords
4. Generate password for "Mail"
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
6. Use as `EMAIL_PASSWORD` secret in GitHub

**Note:** The email address (ashwanidevops@gmail.com) will be used for:
- SMTP authentication (username)
- Sending emails (from)
- Receiving notifications (to)

---

## 🚀 Deployment Steps

### Step 1: Verify Kubernetes Cluster

```bash
# Check Minikube is running
minikube status

# Verify kubectl access
kubectl cluster-info
kubectl get nodes
```

### Step 2: Update Deployment Configuration

The deployment is already configured for `ashwani786/k8s-cicd-demo`.
If you need to change it:

```bash
# Update k8s/deployment.yaml
sed -i 's/ashwani786/YOUR_DOCKERHUB_USERNAME/g' k8s/deployment.yaml
```

### Step 3: Create Initial Kubernetes Resources

```bash
# Navigate to repository
cd k8s-cicd-demo

# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create deployment and service
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# Wait for pods to be ready
kubectl get pods -n production -w
# Press Ctrl+C when pods are Running
```

### Step 4: Verify Initial Deployment

```bash
# Check deployment
kubectl get deployment -n production

# Check pods
kubectl get pods -n production

# Check service
kubectl get svc -n production

# Test application
MINIKUBE_IP=$(minikube ip)
curl http://$MINIKUBE_IP:30100
curl http://$MINIKUBE_IP:30100/health
```

### Step 5: Push to Trigger Automated Deployment

```bash
# Check git status
git status

# Add all files
git add .

# Commit changes
git commit -m "Add monitoring and email notifications to capstone project"

# Push to main branch - THIS TRIGGERS THE PIPELINE!
git push origin main
```

---

## 📊 What Happens After Push

### Automated Pipeline Flow:

```
1. Build & Test Job
   ├─ Checkout code ✅
   ├─ Setup Node.js ✅
   ├─ Install dependencies ✅
   ├─ Run tests ✅
   ├─ Build Docker image ✅
   └─ Push to Docker Hub ✅

2. Deploy Monitoring Job
   ├─ Setup kubectl ✅
   ├─ Deploy Prometheus ✅
   ├─ Deploy Grafana ✅
   └─ Wait for readiness ✅

3. Deploy Application Job
   ├─ Update deployment image ✅
   ├─ Wait for rollout ✅
   ├─ Run smoke tests ✅
   └─ Send email notification 📧

4. Rollback Job (if failure)
   ├─ Automatic rollback 🔄
   └─ Send rollback email 📧
```

---

## 📧 Email Notifications

### Success Email:
```
✅ Capstone Project Deployment Successful!

📦 Deployed Components:
• Application: k8s-cicd-demo (production)
• Prometheus (monitoring)
• Grafana (monitoring)

🔗 Access URLs:
• Application: http://NODE_IP:30100
• Prometheus: http://NODE_IP:30090
• Grafana: http://NODE_IP:30030 (admin/admin)

📊 Deployment Status:
• Tests: Passed ✅
• Docker Build: Success ✅
• Monitoring Stack: Deployed ✅
• Application: Deployed ✅
• Smoke Tests: Passed ✅
```

---

## 🔍 Post-Deployment Verification

### Access Application

```bash
# Get Minikube IP
MINIKUBE_IP=$(minikube ip)

# Test application
curl http://$MINIKUBE_IP:30100
curl http://$MINIKUBE_IP:30100/health

# Open in browser
open http://$MINIKUBE_IP:30100
```

### Access Monitoring

```bash
# Prometheus
open http://$MINIKUBE_IP:30090

# Grafana (admin/admin)
open http://$MINIKUBE_IP:30030
```

### Check Pods

```bash
# Application pods
kubectl get pods -n production

# Monitoring pods
kubectl get pods -n monitoring

# All pods
kubectl get pods -A
```

### View Logs

```bash
# Application logs
kubectl logs -n production -l app=k8s-cicd-demo --tail=50

# Prometheus logs
kubectl logs -n monitoring -l app=prometheus --tail=50

# Grafana logs
kubectl logs -n monitoring -l app=grafana --tail=50
```

---

## 📊 Monitoring Setup

### Prometheus Queries

Access Prometheus at `http://<MINIKUBE-IP>:30090` and try:

```promql
# CPU usage
rate(container_cpu_usage_seconds_total{namespace="production"}[5m])

# Memory usage
container_memory_usage_bytes{namespace="production"}

# Pod count
count(kube_pod_info{namespace="production"})
```

### Grafana Dashboards

1. Access Grafana at `http://<MINIKUBE-IP>:30030`
2. Login: admin/admin
3. Go to Dashboards → Import
4. Enter Dashboard ID: **315** (Kubernetes cluster monitoring)
5. Select Prometheus data source
6. Click Import

---

## 🔄 Making Changes

### Test the Automated Workflow

1. **Make a code change:**
```bash
# Edit app/server.js
nano app/server.js
# Change the message or version
```

2. **Commit and push:**
```bash
git add app/server.js
git commit -m "Update application message"
git push origin main
```

3. **Watch automatic deployment:**
- Go to GitHub → Actions tab
- Watch the workflow execute
- Check your email for notification
- Verify the change is live

---

## 🛠️ Troubleshooting

### Pipeline Fails at Build

```bash
# Check Docker Hub credentials in GitHub Secrets
# Verify tests pass locally:
cd app
npm install
npm test
```

### Pipeline Fails at Deploy

```bash
# Verify KUBECONFIG secret is correct
# Test kubectl locally:
kubectl cluster-info

# Check namespace exists:
kubectl get namespace production
```

### Monitoring Not Deploying

```bash
# Check monitoring namespace
kubectl get namespace monitoring

# Check monitoring pods
kubectl get pods -n monitoring

# View logs
kubectl logs -n monitoring -l app=prometheus
kubectl logs -n monitoring -l app=grafana
```

### Email Not Received

```bash
# Verify email secrets in GitHub
# Check spam folder
# Verify Gmail App Password is correct
# Check GitHub Actions logs for email step
```

---

## 📁 Project Structure

```
k8s-cicd-demo/
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD pipeline with monitoring
├── app/
│   ├── Dockerfile                  # Container image
│   ├── package.json                # Dependencies
│   ├── server.js                   # Application code
│   └── test/
│       └── server.test.js          # Unit tests
├── k8s/
│   ├── namespace.yaml              # Production namespace
│   ├── deployment.yaml             # App deployment
│   └── service.yaml                # NodePort service
├── monitoring/
│   ├── prometheus-grafana-setup.yaml  # Monitoring stack
│   └── MONITORING-GUIDE.md         # Monitoring documentation
├── CAPSTONE-DEPLOYMENT-GUIDE.md    # This file
├── README.md                       # Project overview
└── NEXT-STEPS.md                   # Future enhancements
```

---

## 🎯 Success Criteria

- [ ] Minikube running
- [ ] GitHub secrets configured
- [ ] Initial deployment working
- [ ] Code pushed to GitHub
- [ ] GitHub Actions workflow completed
- [ ] Email notification received
- [ ] Application accessible
- [ ] Prometheus accessible
- [ ] Grafana accessible
- [ ] All pods running

---

## 🔗 Quick Access URLs

After deployment:

```bash
# Get Minikube IP
MINIKUBE_IP=$(minikube ip)

# URLs:
echo "Application: http://$MINIKUBE_IP:30100"
echo "Prometheus: http://$MINIKUBE_IP:30090"
echo "Grafana: http://$MINIKUBE_IP:30030"
```

---

## 📚 Additional Resources

- **MONITORING-GUIDE.md** - Detailed monitoring setup
- **README.md** - Project overview
- **NEXT-STEPS.md** - Future enhancements
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)

---

## 🎉 Congratulations!

You now have a complete capstone project with:
- ✅ Automated CI/CD
- ✅ Monitoring & Observability
- ✅ Email Notifications
- ✅ Automatic Rollback
- ✅ Production-ready setup

**Just push your code and watch everything deploy automatically! 🚀**

---

**Made with ❤️ for DevOps Learning**