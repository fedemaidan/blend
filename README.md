# blend
# psql: -U sorby_development -d BLDB

# LOCAL: pg_dump --data-only -U sorby_development -d BLDB -f dump/backup.sql
# instalar local el dump: psql -U sorby_development -d BLDB < dump/backup2-6-2025.sql

# Conectarme 
PGPASSWORD=rllBciZldfhGwLsnlIGswIVRCLtSlJkD psql -h interchange.proxy.rlwy.net -U postgres -p 22900 -d railway
# LLEVARME LOS DATOS RAILWAY A LOCAL: 
PGPASSWORD=rllBciZldfhGwLsnlIGswIVRCLtSlJkD pg_dump -U postgres -p 22900 -h interchange.proxy.rlwy.net railway >> dump/backup.sql

# LLEVARME LOS DATOS LOCALES A RAILWAY
psql "postgresql://postgres:rllBciZldfhGwLsnlIGswIVRCLtSlJkD@interchange.proxy.rlwy.net:22900/railway" < dump/backup.sql