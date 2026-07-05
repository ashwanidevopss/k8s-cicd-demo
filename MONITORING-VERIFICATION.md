# Monitoring Verification & Setup Guide

## Current Status Check

### ✅ All Components Running:

```bash
# Application Pods (5 replicas)
kubectl get pods -n production -l app=k8s-cicd-demo
# Expected: 5 pods in Running state

# Monitoring Pods
kubectl get pods -n monitoring
# Expected: prometheus and grafana pods in Running state
```

## Monitoring Configuration

### 1. **Application Deployment** ✅

**File:** `k8s/deployment.yaml`

**Prometheus Annotations Added:**
```yaml
annotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "3000"
  prometheus.io/path: "/metrics"
```

These annotations tell Prometheus to:
- Scrape metrics from this application
- Use port 3000
- Get metrics from `/metrics` endpoint

### 2. **Prometheus Configuration** ✅

**File:** `monitoring/prometheus-grafana-setup.yaml`

**Job Configuration:**
```yaml
- job_name: 'k8s-cicd-demo'
  kubernetes_sd_configs:
    - role: pod
      namespaces:
        names:
          - production
  relabel_configs:
    - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
      action: keep
      regex: true
```

This configuration:
- Discovers pods in `production` namespace
- Only scrapes pods with `prometheus.io/scrape: "true"` annotation
- Automatically finds all k8s-cicd-demo pods

### 3. **Grafana Configuration** ✅

**Datasource:** Prometheus (pre-configured)
**URL:** `http://prometheus:9090`

## Access Monitoring Stack

### Open Grafana:
```bash
minikube service grafana -n monitoring
```
- **Username:** `admin`
- **Password:** `admin`
- **Note:** Change password on first login

### Open Prometheus:
```bash
minikube service prometheus -n monitoring
```

### Open Application:
```bash
minikube service k8s-cicd-demo -n production
```

## Verify Monitoring is Working

### Step 1: Check Prometheus Targets

1. Open Prometheus: `minikube service prometheus -n monitoring`
2. Go to: **Status → Targets**
3. Look for job: `k8s-cicd-demo`
4. **Expected:** 5 targets (one for each pod) with state **UP**

### Step 2: Query Metrics in Prometheus

Try these queries:

```promql
# Check if metrics are being scraped
up{job="k8s-cicd-demo"}

# CPU usage
rate(process_cpu_seconds_total{job="k8s-cicd-demo"}[5m])

# Memory usage
process_resident_memory_bytes{job="k8s-cicd-demo"}

# HTTP requests (if app exposes this metric)
http_requests_total{job="k8s-cicd-demo"}

# Node.js specific metrics
nodejs_heap_size_used_bytes{job="k8s-cicd-demo"}
```

### Step 3: Create Grafana Dashboard

1. Open Grafana: `minikube service grafana -n monitoring`
2. Login with `admin/admin`
3. Go to: **Dashboards → New → New Dashboard**
4. Click: **Add visualization**
5. Select datasource: **Prometheus**
6. Add queries:

**Panel 1: Pod Status**
```promql
up{job="k8s-cicd-demo"}
```

**Panel 2: CPU Usage**
```promql
rate(process_cpu_seconds_total{job="k8s-cicd-demo"}[5m])
```

**Panel 3: Memory Usage**
```promql
process_resident_memory_bytes{job="k8s-cicd-demo"} / 1024 / 1024
```

**Panel 4: Request Rate**
```promql
rate(http_requests_total{job="k8s-cicd-demo"}[5m])
```

## Troubleshooting

### Issue: No targets in Prometheus

**Check 1: Verify annotations**
```bash
kubectl get pod -n production -l app=k8s-cicd-demo -o yaml | grep -A 3 annotations
```
Expected output should include:
```yaml
annotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "3000"
  prometheus.io/path: "/metrics"
```

**Check 2: Verify Prometheus config**
```bash
kubectl logs -n monitoring deployment/prometheus | grep k8s-cicd-demo
```

**Solution:** Apply updated deployment
```bash
kubectl apply -f k8s/deployment.yaml
kubectl rollout restart deployment/k8s-cicd-demo -n production
```

### Issue: Metrics endpoint not found

**Check if app exposes /metrics:**
```bash
kubectl port-forward -n production svc/k8s-cicd-demo 8080:80
curl http://localhost:8080/metrics
```

**If 404:** Your Node.js app needs to expose metrics. Add `prom-client` library:

```javascript
// In server.js
const promClient = require('prom-client');
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### Issue: Grafana can't connect to Prometheus

**Check Prometheus service:**
```bash
kubectl get svc -n monitoring prometheus
```

**Test connection from Grafana pod:**
```bash
kubectl exec -n monitoring deployment/grafana -- wget -O- http://prometheus:9090/api/v1/status/config
```

## Apply Updated Configuration

If you made changes, apply them:

```bash
# Update deployment with Prometheus annotations
kubectl apply -f k8s/deployment.yaml

# Restart deployment to pick up changes
kubectl rollout restart deployment/k8s-cicd-demo -n production

# Wait for rollout to complete
kubectl rollout status deployment/k8s-cicd-demo -n production

# Verify pods are running
kubectl get pods -n production -l app=k8s-cicd-demo
```

## Monitoring Checklist

- [ ] Application pods running (5 replicas)
- [ ] Prometheus pod running
- [ ] Grafana pod running
- [ ] Deployment has Prometheus annotations
- [ ] Prometheus shows k8s-cicd-demo targets as UP
- [ ] Can query metrics in Prometheus
- [ ] Grafana can connect to Prometheus
- [ ] Created dashboard in Grafana

## Quick Verification Commands

```bash
# Check all components
kubectl get pods -n production -l app=k8s-cicd-demo
kubectl get pods -n monitoring
kubectl get svc -n monitoring

# Open monitoring tools
minikube service grafana -n monitoring &
minikube service prometheus -n monitoring &

# Check Prometheus targets
echo "Open Prometheus and go to Status → Targets"
echo "Look for job 'k8s-cicd-demo' with 5 UP targets"
```

## Summary

✅ **Application:** 5 pods running with Prometheus annotations
✅ **Prometheus:** Configured to scrape k8s-cicd-demo
✅ **Grafana:** Pre-configured with Prometheus datasource
✅ **Access:** Use `minikube service` commands

**Everything is ready for monitoring!** 🎉

Next steps:
1. Open Prometheus and verify targets are UP
2. Open Grafana and create dashboards
3. Monitor your application metrics in real-time