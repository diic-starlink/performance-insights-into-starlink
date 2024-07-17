#!/bin/bash

export HOST=postgres

mkdir -p data
while true; do
	# Sleep for 3 hours before syncing again.
	# This is not precise, but it also does not have to be.
	sleep 10800

	duckdb data/data.db "\
		INSTALL postgres; LOAD postgres; \
		ATTACH 'dbname=postgres user=postgres host=$HOST password=postgres port=5432' AS postgres (TYPE POSTGRES, READ_ONLY); \
		ATTACH 'data/duck.db' AS duckdb (TYPE DUCKDB, READ_WRITE); \
		COPY FROM DATABASE postgres TO duckdb; \
		SELECT * FROM duckdb.public.ping_data LIMIT 10;"
done
