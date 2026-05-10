

INSTANCE_ID=team1 APP_PORT=8080 DM_PORT_START=9000 DM_PORT_END=9099   docker compose -p team1 down
docker compose -f docker-compose.ollama.yml down

git pull

INSTANCE_ID=team1 APP_PORT=8080 DM_PORT_START=9000 DM_PORT_END=9099   docker compose -p team1 up -d --build
docker compose -f docker-compose.ollama.yml up -d --build
