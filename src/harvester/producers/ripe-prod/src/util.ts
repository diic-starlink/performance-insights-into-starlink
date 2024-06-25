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
}

export {
	ProbeStatus,
	Probe,
	string_to_probestatus,
	Measurement,
};
