# Prometheus & Grafana Monitoring Guide

## Overview
This guide explains how to set up and use Prometheus and Grafana to monitor your Kubernetes application deployed via CI/CD pipeline.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Monitoring Stack                        │
└─────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  Application │─────▶│  Prometheus  │─────▶│   Grafana    │
│  (Metrics)   │      │  (Scraping)  │      │ (Dashboards) │
└──────────────┘      └──────────────┘      └──────────────┘
     Port 3000             Port 9090             Port 3000
     /metrics              /metrics              /dashboards
```

## Quick Start

### 1. Deploy Monitoring Stack

```bash
# Deploy Prometheus and Grafana
kubectl apply -f monitoring/prometheus-grafana-setup.yaml

# Wait for pods to be ready
kubectl get pods -n monitoring -w
```

### 2. Verify Deployment

```bash
# Check all monitoring resources
kubectl get all -n monitoring

# Expected output:
# NAME                              READY   STATUS    RESTARTS   AGE
# pod/prometheus-xxx                1/1     Running   0          2m
# pod/grafana-xxx                   1/1     Running   0          2m
#
# NAME                 TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)
# service/prometheus   NodePort   10.96.x.x       <none>        9090:30090/TCP
# service/grafana      NodePort   10.96.x.x       <none>        3000:30030/TCP
```

### 3. Access Prometheus

```bash
# Get Minikube IP
minikube ip

# Access Prometheus UI
# URL: http://<MINIKUBE-IP>:30090

# Or use port forwarding
kubectl port-forward -n monitoring service/prometheus 9090:9090

# Access at: http://localhost:9090
```

### 4. Access Grafana

```bash
# Access Grafana UI
# URL: http://<MINIKUBE-IP>:30030

# Or use port forwarding
kubectl port-forward -n monitoring service/grafana 3000:3000

# Access at: http://localhost:3000
# Default credentials:
# Username: admin
# Password: admin
```

## Application Metrics Setup

### Update Your Application to Expose Metrics

Add Prometheus client to your Node.js application:

**app/package.json:**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "prom-client": "^14.2.0"
  }
}
```

**app/server.js:**
```javascript
const express = require('express');
const promClient = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3000;

// Create a Registry
const register = new promClient.Registry();

// Add default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Middleware to track metrics
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.labels(req.method, req.route?.path || req.path, res.statusCode).observe(duration);
    httpRequestTotal.labels(req.method, req.route?.path || req.path, res.statusCode).inc();
  });
  
  next();
});

// Application routes
app.get('/', (req, res) => {
  res.json({
    message: 'Hello from Kubernetes!',
    version: process.env.APP_VERSION || '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Metrics available at http://localhost:${PORT}/metrics`);
});

module.exports = server;
```

### Update Deployment with Prometheus Annotations

**k8s/deployment.yaml:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-k8s
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hello-k8s
  template:
    metadata:
      labels:
        app: hello-k8s
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3000"
        prometheus.io/path: "/metrics"
    spec:
      containers:
      - name: hello-k8s
        image: YOUR_DOCKERHUB_USERNAME/hello-k8s:latest
        ports:
        - containerPort: 3000
        # ... rest of the configuration
```

## Using Prometheus

### 1. Explore Metrics

Access Prometheus UI and try these queries:

```promql
# CPU usage by pod
rate(container_cpu_usage_seconds_total{namespace="production"}[5m])

# Memory usage by pod
container_memory_usage_bytes{namespace="production"}

# HTTP request rate
rate(http_requests_total[5m])

# HTTP request duration (95th percentile)
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Pod count
count(kube_pod_info{namespace="production"})

# Application uptime
time() - process_start_time_seconds
```

### 2. Create Alerts

Add alerting rules to Prometheus ConfigMap:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    # ... existing config ...
    
    rule_files:
      - /etc/prometheus/alerts.yml
  
  alerts.yml: |
    groups:
    - name: application_alerts
      interval: 30s
      rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} requests/sec"
      
      - alert: PodDown
        expr: up{job="hello-k8s-app"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Pod is down"
          description: "{{ $labels.pod }} in {{ $labels.namespace }} is down"
```

## Using Grafana

### 1. First Login

1. Access Grafana: http://localhost:3000
2. Login with: admin/admin
3. Change password when prompted

### 2. Verify Prometheus Data Source

1. Go to **Configuration** → **Data Sources**
2. Prometheus should already be configured
3. Click **Test** to verify connection

### 3. Import Kubernetes Dashboard

1. Click **+** → **Import**
2. Enter dashboard ID: **315** (Kubernetes cluster monitoring)
3. Select Prometheus data source
4. Click **Import**

### 4. Create Custom Dashboard

**Application Performance Dashboard:**

1. Click **+** → **Create Dashboard**
2. Add panels:

**Panel 1: Request Rate**
```promql
rate(http_requests_total{namespace="production"}[5m])
```

**Panel 2: Response Time (95th percentile)**
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{namespace="production"}[5m]))
```

**Panel 3: Error Rate**
```promql
rate(http_requests_total{namespace="production",status_code=~"5.."}[5m])
```

**Panel 4: Pod Count**
```promql
count(kube_pod_info{namespace="production",pod=~"hello-k8s.*"})
```

**Panel 5: CPU Usage**
```promql
rate(container_cpu_usage_seconds_total{namespace="production",pod=~"hello-k8s.*"}[5m])
```

**Panel 6: Memory Usage**
```promql
container_memory_usage_bytes{namespace="production",pod=~"hello-k8s.*"}
```

### 5. Save Dashboard

1. Click **Save dashboard** icon
2. Name it: "Hello K8s Application Metrics"
3. Click **Save**

## Monitoring Best Practices

### 1. Key Metrics to Monitor

**RED Method (for services):**
- **R**ate: Request rate
- **E**rrors: Error rate
- **D**uration: Request duration

**USE Method (for resources):**
- **U**tilization: CPU, Memory usage
- **S**aturation: Queue depth, wait time
- **E**rrors: Error count

### 2. Set Up Alerts

```yaml
# High CPU usage
- alert: HighCPUUsage
  expr: rate(container_cpu_usage_seconds_total{namespace="production"}[5m]) > 0.8
  for: 5m

# High memory usage
- alert: HighMemoryUsage
  expr: container_memory_usage_bytes{namespace="production"} / container_spec_memory_limit_bytes > 0.9
  for: 5m

# Pod restart
- alert: PodRestarting
  expr: rate(kube_pod_container_status_restarts_total{namespace="production"}[15m]) > 0
  for: 5m
```

### 3. Dashboard Organization

Create separate dashboards for:
- **Overview**: High-level metrics
- **Application**: App-specific metrics
- **Infrastructure**: Node and cluster metrics
- **Alerts**: Active alerts and history

## Troubleshooting

### Prometheus Not Scraping Metrics

```bash
# Check Prometheus targets
# Go to Prometheus UI → Status → Targets

# Verify pod annotations
kubectl get pod -n production -o yaml | grep -A 3 annotations

# Check if metrics endpoint is accessible
kubectl port-forward -n production <pod-name> 3000:3000
curl http://localhost:3000/metrics
```

### Grafana Not Showing Data

```bash
# Verify Prometheus data source
# Grafana → Configuration → Data Sources → Prometheus → Test

# Check Prometheus is accessible from Grafana pod
kubectl exec -it -n monitoring <grafana-pod> -- wget -O- http://prometheus:9090/api/v1/query?query=up
```

### Missing Metrics

```bash
# Check if application is exposing metrics
kubectl logs -n production <pod-name>

# Verify Prometheus is scraping
kubectl logs -n monitoring <prometheus-pod> | grep "hello-k8s"
```

## Useful Queries

### Application Metrics

```promql
# Request rate by endpoint
sum(rate(http_requests_total[5m])) by (route)

# Average response time
avg(rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m]))

# Error percentage
sum(rate(http_requests_total{status_code=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100
```

### Kubernetes Metrics

```promql
# Pod CPU usage
sum(rate(container_cpu_usage_seconds_total{namespace="production"}[5m])) by (pod)

# Pod memory usage
sum(container_memory_usage_bytes{namespace="production"}) by (pod)

# Pod restart count
sum(kube_pod_container_status_restarts_total{namespace="production"}) by (pod)
```

## Cleanup

```bash
# Remove monitoring stack
kubectl delete -f monitoring/prometheus-grafana-setup.yaml

# Or delete namespace
kubectl delete namespace monitoring
```

## Next Steps

1. ✅ Set up custom alerts
2. ✅ Create application-specific dashboards
3. ✅ Configure alert notifications (email, Slack)
4. ✅ Add more custom metrics
5. ✅ Set up long-term storage (Thanos, Cortex)
6. ✅ Implement distributed tracing (Jaeger)
7. ✅ Add log aggregation (ELK/EFK stack)

## Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [Grafana Dashboard Gallery](https://grafana.com/grafana/dashboards/)

---

**Happy Monitoring! 📊**