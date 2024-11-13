#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env

# Default values
RESOURCE_GROUP=${RESOURCE_GROUP:-"secureapp-rg"}
CLUSTER_NAME=${CLUSTER_NAME:-"secureapp-aks"}
NODE_COUNT=${NODE_COUNT:-3}
NODE_VM_SIZE=${NODE_VM_SIZE:-"Standard_DS2_v2"}
LOCATION=${LOCATION:-"eastus"}
K8S_VERSION=${K8S_VERSION:-"1.25.6"}

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo "🚀 Starting AKS cluster setup..."

# Check if required tools are installed
command -v az >/dev/null 2>&1 || { echo -e "${RED}Error: Azure CLI is not installed${NC}" >&2; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo -e "${RED}Error: kubectl is not installed${NC}" >&2; exit 1; }

# Create resource group
echo "Creating resource group: $RESOURCE_GROUP"
az group create --name "$RESOURCE_GROUP" --location "$LOCATION"

# Create AKS cluster
echo "Creating AKS cluster: $CLUSTER_NAME"
az aks create \
    --resource-group "$RESOURCE_GROUP" \
    --name "$CLUSTER_NAME" \
    --node-count "$NODE_COUNT" \
    --node-vm-size "$NODE_VM_SIZE" \
    --kubernetes-version "$K8S_VERSION" \
    --enable-managed-identity \
    --enable-addons monitoring \
    --enable-msi-auth-for-monitoring \
    --enable-azure-rbac \
    --enable-pod-security-policy \
    --network-plugin azure \
    --network-policy azure \
    --enable-node-public-ip false \
    --enable-encryption-at-host \
    --tags environment=production application=secureapp

# Get credentials
echo "Getting cluster credentials"
az aks get-credentials --resource-group "$RESOURCE_GROUP" --name "$CLUSTER_NAME"

# Apply network policies
echo "Applying network policies"
kubectl apply -f ../kubernetes/manifests/network-policy.yaml

# Apply pod security policies
echo "Applying pod security policies"
kubectl apply -f ../kubernetes/manifests/pod-security-policy.yaml

# Install monitoring components
echo "Setting up monitoring"
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml

# Create namespace for the application
echo "Creating application namespace"
kubectl create namespace secureapp --dry-run=client -o yaml | kubectl apply -f -

# Label namespace for network policies
kubectl label namespace secureapp name=secureapp --overwrite

echo -e "${GREEN}✅ AKS cluster setup completed successfully!${NC}"
echo "Next steps:"
echo "1. Deploy the application using Helm"
echo "2. Configure Azure Monitor alerts"
echo "3. Set up CI/CD pipelines"

# Verify cluster status
kubectl get nodes
kubectl get pods --all-namespaces