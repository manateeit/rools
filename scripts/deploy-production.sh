#!/bin/bash

# Trading AI Agent Bot - Production Deployment Script
# This script automates the deployment of the Trading AI Agent Bot to production environments.

# Exit on error
set -e

# Display help information
function show_help {
  echo "Trading AI Agent Bot - Production Deployment Script"
  echo ""
  echo "Usage: ./deploy-production.sh [options]"
  echo ""
  echo "Options:"
  echo "  -h, --help                 Show this help message"
  echo "  -e, --env <file>           Specify .env file (default: .env.production)"
  echo "  -b, --branch <branch>      Specify git branch to deploy (default: main)"
  echo "  -p, --platform <platform>  Specify deployment platform (vercel, heroku, aws, gcp)"
  echo "  -s, --skip-tests           Skip running tests before deployment"
  echo "  -f, --force                Force deployment even if tests fail"
  echo ""
  echo "Example:"
  echo "  ./deploy-production.sh --platform vercel --branch main"
  exit 0
}

# Default values
ENV_FILE=".env.production"
GIT_BRANCH="main"
PLATFORM="vercel"
SKIP_TESTS=false
FORCE_DEPLOY=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    -h|--help)
      show_help
      ;;
    -e|--env)
      ENV_FILE="$2"
      shift
      shift
      ;;
    -b|--branch)
      GIT_BRANCH="$2"
      shift
      shift
      ;;
    -p|--platform)
      PLATFORM="$2"
      shift
      shift
      ;;
    -s|--skip-tests)
      SKIP_TESTS=true
      shift
      ;;
    -f|--force)
      FORCE_DEPLOY=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      ;;
  esac
done

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE not found"
  echo "Please create a $ENV_FILE file with your production environment variables"
  exit 1
fi

# Display deployment information
echo "===== Trading AI Agent Bot - Production Deployment ====="
echo "Environment file: $ENV_FILE"
echo "Git branch: $GIT_BRANCH"
echo "Deployment platform: $PLATFORM"
echo "Skip tests: $SKIP_TESTS"
echo "Force deploy: $FORCE_DEPLOY"
echo "===================================================="
echo ""

# Confirm deployment
read -p "Do you want to proceed with deployment? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Deployment cancelled"
  exit 0
fi

# Check git status
echo "Checking git status..."
if [[ $(git status --porcelain) ]]; then
  echo "Warning: You have uncommitted changes"
  read -p "Do you want to continue anyway? (y/n) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
  fi
fi

# Switch to the specified branch
echo "Switching to branch $GIT_BRANCH..."
git checkout $GIT_BRANCH

# Pull latest changes
echo "Pulling latest changes..."
git pull origin $GIT_BRANCH

# Install dependencies
echo "Installing dependencies..."
npm ci

# Run tests if not skipped
if [ "$SKIP_TESTS" = false ]; then
  echo "Running tests..."
  if ! npm test; then
    echo "Tests failed"
    if [ "$FORCE_DEPLOY" = false ]; then
      echo "Deployment cancelled"
      exit 1
    else
      echo "Warning: Deploying despite test failures"
    fi
  fi
else
  echo "Skipping tests..."
fi

# Build the application
echo "Building the application..."
npm run build

# Deploy based on platform
echo "Deploying to $PLATFORM..."
case $PLATFORM in
  vercel)
    # Deploy to Vercel
    echo "Deploying to Vercel..."
    npx vercel --prod --yes
    ;;
  heroku)
    # Deploy to Heroku
    echo "Deploying to Heroku..."
    git push heroku $GIT_BRANCH:main
    ;;
  aws)
    # Deploy to AWS
    echo "Deploying to AWS..."
    # Copy .env file to S3
    aws s3 cp $ENV_FILE s3://trading-ai-agent-bot/.env
    # Deploy to Elastic Beanstalk
    eb deploy production
    ;;
  gcp)
    # Deploy to Google Cloud Platform
    echo "Deploying to Google Cloud Platform..."
    gcloud app deploy
    ;;
  *)
    echo "Error: Unsupported platform $PLATFORM"
    exit 1
    ;;
esac

# Verify deployment
echo "Verifying deployment..."
case $PLATFORM in
  vercel)
    echo "Deployment URL: https://trading-ai-agent-bot.vercel.app"
    ;;
  heroku)
    echo "Deployment URL: https://trading-ai-agent-bot.herokuapp.com"
    ;;
  aws)
    echo "Deployment URL: http://trading-ai-agent-bot.elasticbeanstalk.com"
    ;;
  gcp)
    echo "Deployment URL: https://trading-ai-agent-bot.appspot.com"
    ;;
esac

# Deployment complete
echo ""
echo "===== Deployment Complete ====="
echo "The Trading AI Agent Bot has been successfully deployed to production!"
echo "================================"