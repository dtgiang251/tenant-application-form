#!/bin/bash

DEPLOY_SERVER=$DEPLOY_SERVER

echo "Deploying to ${DEPLOY_SERVER}"
ssh deploy@${DEPLOY_SERVER} 'bash' < ./deploy/server.sh
