docker exec sb_postgres psql -V
docker cp ./postgres/data.sql sb_postgres:/home/data.sql
docker exec -t sb_postgres bash -c 'psql -U postgres -d dev < /home/data.sql'
