

@echo off

set INSTANCE_ID=team1
set APP_PORT=8080
set DM_PORT_START=9000
set DM_PORT_END=9099

docker compose -p team1 down
docker compose -f docker-compose.ollama.yml down

git pull

docker compose -p team1 up -d --build
docker compose -f docker-compose.ollama.yml up -d --build
