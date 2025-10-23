#!/bin/bash
# Helper script to set up the database on Cloud SQL

set -e

echo "Setting up database for Virtual Patient System..."
echo ""

# Database connection details
INSTANCE_CONNECTION_NAME="virtual-patient-system:europe-west3:virtual-patient-db"
DB_USER="postgres"
DB_NAME="virtual-patient-db"

echo "Starting Cloud SQL Proxy..."
cloud-sql-proxy --port 5433 $INSTANCE_CONNECTION_NAME &
PROXY_PID=$!

# Wait for proxy to start
sleep 5

echo "Creating database if it doesn't exist..."
PSQL="/opt/homebrew/opt/postgresql@16/bin/psql"
PGPASSWORD=".nbKFs=4UHOe2dfge536GFdwerer123rvfegRdvs" $PSQL -h 127.0.0.1 -p 5433 -U $DB_USER -d postgres -c "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 || \
PGPASSWORD=".nbKFs=4UHOe2dfge536GFdwerer123rvfegRdvs" $PSQL -h 127.0.0.1 -p 5433 -U $DB_USER -d postgres -c "CREATE DATABASE \"$DB_NAME\""

echo "Database created successfully!"
echo ""

echo "Running Alembic migrations..."
export DATABASE_URL="postgresql+psycopg://$DB_USER:.nbKFs=4UHOe2dfge536GFdwerer123rvfegRdvs@127.0.0.1:5433/$DB_NAME"
source mri_env/bin/activate
alembic upgrade head

echo ""
echo "Database setup complete!"
echo "Stopping Cloud SQL Proxy..."
kill $PROXY_PID

echo "Done!"

