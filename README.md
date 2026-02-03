## Project Overview
This project demonstrates a complete DevOps implementation of a Tic-Tac-Toe web application, showcasing containerization, orchestration, CI/CD pipelines, and Kubernetes deployment.🎯 Project Components & Grading
Public Git Repository (10%)

Docker Containerization (10%)
Docker Compose Orchestration (10%)
CI/CD Pipeline (20%)
Kubernetes Deployment Manifest (10%)
Kubernetes Service (10%)
Kubernetes Ingress (10%)
StatefulSet for Database (10%)
Custom Namespace Deployment (10%)


## Prerequisites
- Docker & Docker Compose
- Kubernetes cluster (minikube, k3s, or cloud provider)
- kubectl configured
- Git

# Clone the repository
git clone https://github.com/aysunsuleymanii/tictactoe-devops.git
cd tictactoe-devops

# Start the application
docker-compose up -d

# Access the application
open http://localhost:3000


# Create namespace
kubectl create namespace tictactoe-game

# Apply all manifests
kubectl apply -f k8s/ -n tictactoe-game

# Check deployment status
kubectl get all -n tictactoe-game

# Get ingress URL
kubectl get ingress -n tictactoe-game


## Project Structure
```
tictactoe-devops/
├── src/                          # Application source code
│   ├── app.js                    # Main application file
│   ├── public/                   # Static assets
│   └── views/                    # Templates
├── Dockerfile                    # Container image definition
├── docker-compose.yml            # Local orchestration
├── .github/
│   └── workflows/
│       └── ci-cd.yml            # GitHub Actions pipeline
├── k8s/                         # Kubernetes manifests
│   ├── namespace.yaml           # Custom namespace
│   ├── configmap.yaml           # Application configuration
│   ├── secrets.yaml             # Sensitive data
│   ├── deployment.yaml          # Application deployment
│   ├── service.yaml             # Service definition
│   ├── ingress.yaml             # Ingress rules
│   ├── database-statefulset.yaml # Database StatefulSet
│   ├── database-service.yaml    # Database service
│   └── database-pvc.yaml        # Persistent volume claims
├── scripts/
│   └── deploy.sh                # Deployment automation
└── README.md                    # This file
```

# Deploy application
kubectl apply -f k8s/deployment.yaml -n tictactoe-game

# Deploy database
kubectl apply -f k8s/database-statefulset.yaml -n tictactoe-game

# Configure networking
kubectl apply -f k8s/service.yaml -n tictactoe-game
kubectl apply -f k8s/ingress.yaml -n tictactoe-game

# Verify deployment
kubectl get pods -n tictactoe-game -w
kubectl logs -f deployment/tictactoe-app -n tictactoe-game
