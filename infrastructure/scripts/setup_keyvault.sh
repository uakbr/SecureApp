#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env

# Default values
RESOURCE_GROUP=${RESOURCE_GROUP:-"secureapp-rg"}
KEYVAULT_NAME=${KEYVAULT_NAME:-"secureapp-kv"}
LOCATION=${LOCATION:-"eastus"}
AKS_IDENTITY_NAME=${AKS_IDENTITY_NAME:-"secureapp-aks-identity"}

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo "🔐 Starting Azure Key Vault setup..."

# Check if Azure CLI is installed
command -v az >/dev/null 2>&1 || { echo -e "${RED}Error: Azure CLI is not installed${NC}" >&2; exit 1; }

# Create Key Vault
echo "Creating Key Vault: $KEYVAULT_NAME"
az keyvault create \
    --name "$KEYVAULT_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --enable-rbac-authorization \
    --enabled-for-deployment true \
    --enabled-for-disk-encryption true \
    --enabled-for-template-deployment true \
    --sku Premium

# Get AKS Managed Identity
echo "Getting AKS managed identity"
AKS_IDENTITY=$(az aks show -g "$RESOURCE_GROUP" -n "${CLUSTER_NAME:-secureapp-aks}" --query identityProfile.kubeletidentity.clientId -o tsv)

# Assign RBAC roles
echo "Assigning RBAC roles"
az role assignment create \
    --role "Key Vault Secrets Officer" \
    --assignee "$AKS_IDENTITY" \
    --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.KeyVault/vaults/$KEYVAULT_NAME"

# Store initial secrets
echo "Storing initial secrets"
az keyvault secret set --vault-name "$KEYVAULT_NAME" --name "JWT-SECRET" --value "$(openssl rand -base64 32)"
az keyvault secret set --vault-name "$KEYVAULT_NAME" --name "DB-PASSWORD" --value "$(openssl rand -base64 32)"

# Enable Key Vault diagnostic settings
echo "Enabling diagnostic settings"
az monitor diagnostic-settings create \
    --name "keyvault-diagnostics" \
    --resource "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.KeyVault/vaults/$KEYVAULT_NAME" \
    --logs '[{"category": "AuditEvent","enabled": true}]' \
    --metrics '[{"category": "AllMetrics","enabled": true}]' \
    --workspace "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.OperationalInsights/workspaces/secureapp-logs"

# Configure Key Vault network rules
echo "Configuring network rules"
az keyvault network-rule add \
    --name "$KEYVAULT_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --vnet-name "${VNET_NAME:-secureapp-vnet}" \
    --subnet "${SUBNET_NAME:-aks-subnet}"

# Enable Key Vault soft delete and purge protection
echo "Enabling additional security features"
az keyvault update \
    --name "$KEYVAULT_NAME" \
    --enable-soft-delete true \
    --enable-purge-protection true

echo -e "${GREEN}✅ Key Vault setup completed successfully!${NC}"
echo "Key Vault URL: https://$KEYVAULT_NAME.vault.azure.net/"
echo
echo "Next steps:"
echo "1. Update application configuration to use Key Vault references"
echo "2. Configure Azure AD Pod Identity"
echo "3. Test secret access from AKS pods"

# Verify Key Vault status
az keyvault show --name "$KEYVAULT_NAME" --resource-group "$RESOURCE_GROUP"