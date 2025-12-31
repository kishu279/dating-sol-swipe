#!/bin/bash

# Interactive utility script for database and project management

echo "Select an option:"
echo "1) Truncate all database tables"
echo "2) Run database migrations"
echo "3) Seed the database"
echo "4) Exit"
read -p "Enter your choice [1-4]: " choice

case $choice in
  1)
    echo "Truncating all database tables..."
    if [ -f "./scripts/truncate.sh" ]; then
      bash ./scripts/truncate.sh
    else
      echo "truncate.sh not found!"
    fi
    ;;
  2)
    echo "Running database migrations..."
    cd packages/database && bunx prisma migrate deploy && cd -
    ;;
  3)
    echo "Seeding the database..."
    cd packages/database && bun run prisma/seed.ts && cd -
    ;;
  4)
    echo "Exiting."
    exit 0
    ;;
  *)
    echo "Invalid option. Exiting."
    exit 1
    ;;
esac
