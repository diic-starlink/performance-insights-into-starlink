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
	result: Object;
}

const stringify_msms = (msms: Measurement[]): string[] => {
	let str_msms: string[] = [];
	for (const msm of msms) str_msms.push(JSON.stringify(msm));
	return str_msms;
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
	last_page: number;
	last_msm_id: number;
}

export {
	ProbeStatus,
	Probe,
	string_to_probestatus,
	Measurement,
	stringify_msms,
};
