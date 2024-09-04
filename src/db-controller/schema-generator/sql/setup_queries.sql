CREATE TABLE IF NOT EXISTS ripe_atlas_probe_data (
	id INTEGER PRIMARY KEY,
	ipv4 VARCHAR,
	asn INTEGER,
	longitude FLOAT,
	latitude FLOAT,
	country VARCHAR
);

CREATE TABLE IF NOT EXISTS ping_data (
	msm_id INTEGER,
	destination VARCHAR,
	source VARCHAR,
	result VARCHAR,
	country VARCHAR,
	prb_id INTEGER,
	timestamp BIGINT,
	msm_type VARCHAR,
	step INTEGER,
	sent_packets INTEGER,
	received_packets INTEGER,
	source_platform VARCHAR,
	CONSTRAINT fk_prb_id FOREIGN KEY (prb_id) REFERENCES ripe_atlas_probe_data(id)
);

CREATE TABLE IF NOT EXISTS disconnect_event_data (
	timestamp BIGINT,
	stored_timestamp BIGINT,
	prb_id INTEGER,
	msm_id INTEGER,
	type VARCHAR,
	event VARCHAR,
	controller VARCHAR,
	asn INTEGER,
	prefix VARCHAR,
	prb_country VARCHAR,
	source_platform VARCHAR,
	CONSTRAINT fk_prb_id FOREIGN KEY (prb_id) REFERENCES ripe_atlas_probe_data(id)
);

CREATE TABLE IF NOT EXISTS traceroute_data (
	msm_id INTEGER,
	prb_id INTEGER,
	destination VARCHAR,
	source VARCHAR,
	protocol VARCHAR,
	af INTEGER,
	size INTEGER,
	paris_id INTEGER,
	result VARCHAR,
	destination_ip_responded BOOLEAN,
	timestamp BIGINT,
	source_platform VARCHAR,
	CONSTRAINT fk_prb_id FOREIGN KEY (prb_id) REFERENCES ripe_atlas_probe_data(id)
);

CREATE TABLE IF NOT EXISTS satellite_data (
	name VARCHAR,
	norad_id INTEGER,
	launch_date VARCHAR,
	decay_date VARCHAR,
	classification VARCHAR
);

CREATE TABLE IF NOT EXISTS tls_data (
	af INTEGER,
	dst_name VARCHAR,
	dst_port VARCHAR,
	src_name VARCHAR,
	method VARCHAR,
	msm_id INTEGER,
	msm_name VARCHAR,
	prb_id INTEGER,
	rt FLOAT,
	ttc FLOAT,
	timestamp BIGINT,
	source_platform VARCHAR,
	CONSTRAINT fk_prb_id FOREIGN KEY (prb_id) REFERENCES ripe_atlas_probe_data(id)
);

CREATE TABLE IF NOT EXISTS http_data (
	data_id VARCHAR PRIMARY KEY,
	src VARCHAR,
	prb_id INTEGER,
	msm_id INTEGER,
	timestamp BIGINT,
	uri VARCHAR,
	source_platform VARCHAR,
	CONSTRAINT fk_prb_id FOREIGN KEY (prb_id) REFERENCES ripe_atlas_probe_data(id)
);

CREATE TABLE IF NOT EXISTS http_result_data (
	data_id VARCHAR,
	af INTEGER,
	msm_id INTEGER,
	bsize INTEGER,
	dst_addr VARCHAR,
	hsize INTEGER,
	method VARCHAR,
	http_status_code INTEGER,
	rt FLOAT,
	CONSTRAINT fk_data_id FOREIGN KEY (data_id) REFERENCES http_data(data_id)
);

CREATE TABLE IF NOT EXISTS dns_data (
	data_id VARCHAR PRIMARY KEY,
	af INTEGER,
	dst_addr VARCHAR,
	origin VARCHAR,
	msm_id INTEGER,
	prb_id INTEGER,
	proto VARCHAR,
	timestamp BIGINT,
	source_platform VARCHAR,
	CONSTRAINT fk_prb_id FOREIGN KEY (prb_id) REFERENCES ripe_atlas_probe_data(id)
);

CREATE TABLE IF NOT EXISTS dns_result_data (
	data_id VARCHAR PRIMARY KEY,
	answer_count INTEGER,
	record_count INTEGER,
	query_id INTEGER,
	nameserver_count INTEGER,
	number_of_queries INTEGER,
	answer_payload_buffer VARCHAR,
	rt FLOAT,
	size INTEGER,
	ttl INTEGER,
	CONSTRAINT fk_data_id FOREIGN KEY (data_id) REFERENCES dns_data(data_id)
);

CREATE TABLE IF NOT EXISTS dns_result_answer_data (
	data_id VARCHAR,
	mname VARCHAR,
	name VARCHAR,
	rdata VARCHAR,
	rname VARCHAR,
	serial INTEGER,
	ttl INTEGER,
	type VARCHAR,
	CONSTRAINT fk_data_id FOREIGN KEY (data_id) REFERENCES dns_result_data(data_id)
);
