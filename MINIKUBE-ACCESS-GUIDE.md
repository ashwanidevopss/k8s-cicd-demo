# Minikube Service Access Guide

## Quick Access Commands

### Access Grafana:
```bash
minikube service grafana -n monitoring
```
This will automatically open Grafana in your browser.

### Access Prometheus:
```bash
minikube service prometheus -n monitoring
```
This will automatically open Prometheus in your browser.

### Access Application:
```bash
minikube service k8s-cicd-demo -n production
```
This will automatically open the application in your browser.

## Get Service URLs (without opening browser):
```bash
# Get Grafana URL
minikube service grafana -n monitoring --url

# Get Prometheus URL
minikube service prometheus -n monitoring --url

# Get Application URL
minikube service k8s-cicd-demo -n production --url
```

## Why `minikube service` is needed?

On Minikube (especially on macOS with Docker driver), NodePort services are not directly accessible via `minikube ip:port`. You must use `minikube service` command which:
1. Creates a tunnel to the service
2. Provides the correct accessible URL
3. Optionally opens it in your browser

## Alternative: Minikube Tunnel

If you want direct IP access, run:
```bash
minikube tunnel
```
Keep this running in a separate terminal. Then you can access services at:
- Grafana: http://127.0.0.1:30030
- Prometheus: http://127.0.0.1:30090
- Application: http://127.0.0.1:30100

## Default Credentials

### Grafana:
- **URL:** Run `minikube service grafana -n monitoring`
- **Username:** `admin`
- **Password:** `admin`
- **Note:** You'll be prompted to change password on first login

### Prometheus:
- **URL:** Run `minikube service prometheus -n monitoring`
- **No authentication required**

## Troubleshooting

### Issue: "Exiting due to SVC_UNREACHABLE"
**Solution:** Service might not be ready yet
```bash
kubectl get pods -n monitoring
# Wait until all pods are Running
```

### Issue: "service not found"
**Solution:** Check if service exists
```bash
kubectl get svc -n monitoring
```

### Issue: Browser doesn't open
**Solution:** Get URL manually and open it
```bash
minikube service grafana -n monitoring --url
# Copy the URL and paste in browser
```

## All Services Quick Access

```bash
# Open all monitoring services
minikube service grafana -n monitoring &
minikube service prometheus -n monitoring &

# Open application
minikube service k8s-cicd-demo -n production &
```

## Summary

✅ **Grafana:** `minikube service grafana -n monitoring`
✅ **Prometheus:** `minikube service prometheus -n monitoring`
✅ **Application:** `minikube service k8s-cicd-demo -n production`

**No port forwarding needed!** Just use `minikube service` command. 🎉