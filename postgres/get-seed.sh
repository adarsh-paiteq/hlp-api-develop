export $(grep -v '^#' .env | xargs)
docker exec sb_postgres pg_dump -V
docker exec sb_postgres pg_dump ${POSTGRES_DUMP_URL} --verbose -T hdb_catalog.* > ./postgres/data.sql
