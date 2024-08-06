import {
	NORAD_URL,
	Satellite,
} from "./util";
import { storeData } from "./store.controller";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const norad_up = async () => {
	const response = await fetch(NORAD_URL);
	if (response.status !== 200) {
		return false;
	}
	return true;
};

const url_of_satellite = (norad_id: number) => {
	return NORAD_URL + "satellite/?s=" + norad_id;
};

const fetch_satellite = async (norad_id: number, retry = 1): Promise<string> => {
	if (retry > 10) {
		console.error(`Failed to fetch Norad ID: ${norad_id}`);
		process.exit(1);
	}

	try {
		const res = await fetch(url_of_satellite(norad_id));
		return res.text();
	} catch (err) {
		console.error(`Error fetching Norad ID: ${norad_id}`);
		fetch_satellite(norad_id, retry + 1);
	}

}

// Matches dates in the format: January 1, 1970
const get_launch_date = (html: string): Date => {
	if (html.includes("November 30, -0001")) return new Date(Date.parse("January 1, 1970"));
	const line = /Launch\sdate<\/B>:\s<a[^>]+>([A-Z][a-z]+\s[0-9][0-9]?,\s[0-9][0-9][0-9][0-9])/.exec(html);
	return new Date(Date.parse(line[1]));
}

const get_decay_date = (html: string): boolean | Date => {
	if (!html.includes("Decay date")) return false;

	const line = /Decay\sdate<\/B>:\s([0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9])/.exec(html);
	if (!line) return false;

	return new Date(Date.parse(line[1]));
}

const get_name = (html: string) => {
	const line = /<H1>([^<]*)<\/H1>/.exec(html);
	return line[1]; // First group is the name as there [0] is the whole match and [1] is the first group.
}

const get_classification = (html: string): boolean | string => {
	if (!html.includes("classified as")) return false;

	const line = /classified\sas:\s<ul>\s*<li[^>]+><A[^>]+>([^<]*)<\/A>/.exec(html);
	if (!line) return false;
	return line[1];
}

const get_maximum_norad_id = (html: string) => {
	// N2YO holds in the head a dropdown menu with the most recent satellite launches.
	// Each of these dropdown entries has the form /satellite/?s=12345
	// This includes the highest norad id entry N2YO knows about and that is the one
	// we want.
	const regex = /\/satellite\/\?s=[0-9]+/g;
	const matches = html.match(regex);

	let max_id = 0;
	for (const match of matches) {
		const id = parseInt(match.match(/[0-9]+/)[0]);
		if (id) max_id = Math.max(id, max_id);
	}
	return max_id;
}

const crawl_satellites = async (last_norad_id = 1) => {
	let norad_id = last_norad_id;

	let html = await fetch_satellite(norad_id);
	const maximum_norad_id = get_maximum_norad_id(html);
	console.log(`Maximum Norad ID: ${maximum_norad_id}`);

	while (norad_id < maximum_norad_id) {
		if (!html) {
			++norad_id;
			html = await fetch_satellite(norad_id);
			continue;
		}

		// Build Satellite Object from HTML
		const launch_date = get_launch_date(html);
		const decay_date = get_decay_date(html);
		const name = get_name(html);
		const classification = get_classification(html);

		// Definition of Satellite: see util.ts.
		const satellite: Satellite = { name, norad_id, launch_date, decay_date, classification };

		// Store satellite data in database directly.
		storeData(satellite); // TODO(rrcomtech): Do not do this, if satellite is already in DB

		++norad_id;
		html = await fetch_satellite(norad_id);
	}
};

const main = async () => {
	if (!(await norad_up())) {
		console.error("N2YO is down.");
		return;
	}

	// Wait for 10 seconds to ensure the database is up.
	await new Promise((resolve) => setTimeout(resolve, 10000));

	await crawl_satellites(1);
};

main();

