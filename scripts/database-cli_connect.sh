#!/bin/bash

CONTAINER_ID="83ea91b011ac"
DB_USER="user"
DB_NAME="mydatabase"

sudo docker exec -it "$CONTAINER_ID" psql -U "$DB_USER" -d "$DB_NAME"
