#!/bin/bash

# Deploy to Google Cloud Run

echo "=== Deploying Virtual Patient System to Production ==="
echo ""

# Configuration
PROJECT_ID="virtual-patient-system"
REGION="europe-west1"
SERVICE_NAME="virtual-patient-system-eu"
REPOSITORY="virtual-patient"
IMAGE_NAME="virtual-patient-system"

# Get current git commit hash for tagging
GIT_COMMIT=$(git rev-parse HEAD)
IMAGE_TAG="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:${GIT_COMMIT}"
IMAGE_LATEST="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:latest"

echo "1. Building Docker image..."
echo "   Tag: ${GIT_COMMIT}"
echo ""

docker build -t "${IMAGE_TAG}" -t "${IMAGE_LATEST}" .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

echo ""
echo "2. Pushing image to Artifact Registry..."
echo ""

docker push "${IMAGE_TAG}"
docker push "${IMAGE_LATEST}"

if [ $? -ne 0 ]; then
    echo "❌ Docker push failed!"
    exit 1
fi

echo ""
echo "3. Deploying to Cloud Run..."
echo ""

gcloud run deploy "${SERVICE_NAME}" \
    --image "${IMAGE_TAG}" \
    --platform managed \
    --region "${REGION}" \
    --project "${PROJECT_ID}" \
    --allow-unauthenticated

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment completed successfully!"
    echo ""
    echo "Service URL: https://virtual-patients-tum.com"
    echo ""
else
    echo ""
    echo "❌ Deployment failed!"
    exit 1
fi
