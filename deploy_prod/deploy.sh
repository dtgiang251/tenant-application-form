#!/bin/bash

DEPLOY_SERVER_PROD=$DEPLOY_SERVER_PROD

echo "Deploying to ${DEPLOY_SERVER_PROD}"
ssh deploy@${DEPLOY_SERVER_PROD} 'bash' < ./deploy_prod/server.sh
