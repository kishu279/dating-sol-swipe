#!/bin/bash

# Docker container ID or name
CONTAINER="83ea91b011ac"

# Database credentials
DB_USER="user"
DB_NAME="mydatabase"

SQL=$(cat <<'EOF'
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE 'TRUNCATE TABLE public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;
EOF
)

sudo docker exec -i "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" <<EOF
$SQL
EOF
