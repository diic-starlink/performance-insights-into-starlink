interface Measurement {
	measurement_id: number;
	probe_id: number;
	timestamp: number;
	from: string;
	to: string;
	protocol: string;
	type: string;
	group_id: string;
	stored_timestamp: number;
	qbuf: string;
	result: unknown;
}

interface PingData {
	msm_id: number;
	dst_addr: string;
	from: string;
	country: string;
	prb_id: number;
	result: unknown;
	timestamp: string;
	step: number;
	sent: number;
	rcvd: number;
	source_platform: string;
};

interface DisconnectEventData {
	timestamp: number;
	stored_timestamp: number;
	prb_id: number;
	msm_id: number;
	type: string;
	event: string;
	controller: string;
	asn: number;
	prefix: string;
	country: string;
	source_platform: string;
}

interface TracerouteData {
	msm_id: number;
	prb_id: number;
	dst_addr: string;
	from: string;
	proto: string;
	af: number;
	size: number;
	paris_id: number;
	result: unknown;
	source_platform: string;
	destination_ip_responded: boolean;
	timestamp: unknown;
};

interface TLSData {
	af: 4 | 6;
	dst_name: string;
	dst_port: string;
	from: string;
	method: string;
	msm_id: number;
	msm_name: string;
	prb_id: number;
	rt: number;
	ttc: number;
	source_platform: string;
	timestamp: number;
};

interface HttpData {
	from: string;
	lts: number;
	msm_id: number;
	msm_name: string;
	prb_id: number;
	timestamp: number;
	uri: string;
	result: HttpResultData[];
	source_platform: string;
};

interface HttpResultData {
	af: 4 | 6;
	bsize: number;
	dst_addr: string;
	hsize: number;
	method: "GET" | "HEAD" | "POST";
	status_code: number;
	rt: number;
	src_addr: string;
};

enum ProbeStatus {
	CONNECTED = 'Connected',
	DISCONNECTED = 'Disconnected',
	ABANDONED = 'Abandoned',
}

const string_to_probestatus = (status: string): ProbeStatus => {
	switch (status) {
		case 'Connected':
			return ProbeStatus.CONNECTED;
		case 'Disconnected':
			return ProbeStatus.DISCONNECTED;
		default:
			return ProbeStatus.ABANDONED;
	}
};

interface Probe {
	country: string;
	geometry: number[];
	id: number;
	status: ProbeStatus;
	ipv4: string;
	asn: number;
}

export {
	ProbeStatus,
	Probe,
	string_to_probestatus,
	Measurement,
	PingData,
	DisconnectEventData,
	TracerouteData,
	TLSData,
	HttpData,
	HttpResultData
};
