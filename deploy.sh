#!/bin/bash
set -x

# ----- Backend -----
cd ./mindmeld-backend

## Rebuild docker image
docker build -t mindmeld-backend . || exit

## Export docker image to .tar
docker save -o mindmeld-backend.tar mindmeld-backend || exit

## Upload image
scp mindmeld-backend.tar andre@mindmeld.raider.dev:~/apps/mindmeld || exit

## Delete .tar file
rm mindmeld-backend.tar || exit


# ----- Frontend -----
cd ../mindmeld-frontend

## Rebuild docker image
docker build -t mindmeld-frontend . || exit

## Export docker image to .tar
docker save -o mindmeld-frontend.tar mindmeld-frontend || exit

## Upload image
scp mindmeld-frontend.tar andre@mindmeld.raider.dev:~/apps/mindmeld || exit

## Delete .tar file
rm mindmeld-frontend.tar || exit


# ----- Compose -----

cd ../

## Upload docker-compose.yml
scp docker-compose.yml andre@mindmeld.raider.dev:~/apps/mindmeld || exit

# Import image on server, remove old dangling images and compose up (detached)
ssh andre@mindmeld.raider.dev "cd ~/apps/mindmeld && docker load < mindmeld-backend.tar && docker load < mindmeld-frontend.tar && docker-compose up -d && docker image prune -f"
