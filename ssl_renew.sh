#!/bin/bash

COMPOSE="/usr/bin/docker-compose --no-ansi"
DOCKER="/usr/bin/docker"

cd /home/andre/apps/mindmeld/
$COMPOSE run mindmeld-certbot renew && $COMPOSE kill -s SIGHUP mindmeld-webserver
$DOCKER system prune -af
