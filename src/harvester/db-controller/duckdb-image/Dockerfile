FROM ubuntu:24.04

WORKDIR /app
COPY ./sync.sh .

RUN apt update && apt install -y wget unzip
RUN /bin/bash -c 'set -ex && \
	ARCH=`uname -m` && \
	if [ "$ARCH" == "x86_64" ]; then \
	wget https://github.com/duckdb/duckdb/releases/download/v1.0.0/duckdb_cli-linux-amd64.zip && \
	unzip duckdb_cli-linux-amd64.zip && chmod +x duckdb && rm duckdb_cli-linux-amd64.zip && \
	mkdir /app/bin && mv duckdb /app/bin; \
	else \
	wget "https://github.com/duckdb/duckdb/releases/download/v1.0.0/duckdb_cli-linux-aarch64.zip" && \
	unzip duckdb_cli-linux-aarch64.zip && chmod +x duckdb && rm duckdb_cli-linux-aarch64.zip && \
	mkdir /app/bin && mv duckdb /app/bin; \
	fi'

ENV PATH="/app/bin:$PATH"

CMD ["/bin/bash", "./sync.sh"]
