import fs from "fs";
import readLastLines from "read-last-lines";
import {
	NORAD_URL,
	Satellite,
} from "./util";

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

const is_404 = (html: string) => {
	// Norad returns not really 404 on invalid satellite id.
	// It returns an empty satellite page, dating the launch date to January 1, 1970.
	// Aside from that, there were no satellites launched on January 1, 1970.
	if (!html) return true;
	return html.includes("January 1, 1970");
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

const append_to_file = (satellite: Satellite, filename = "output.csv") => {
	const data = `${satellite.name},${satellite.norad_id},${satellite.launch_date},${satellite.decay_date},${satellite.classification}\n`;
	fs.appendFileSync(filename, data);
}

const write_to_file = (satellites: Satellite[], filename = "output.csv") => {
	let csv = "Name,Norad ID,Launch Date,Decay Date,Classification\n";
	for (const satellite of satellites) {
		csv += `${satellite.name},${satellite.norad_id},${satellite.launch_date},${satellite.decay_date}\n`;
	}
	fs.writeFileSync(filename, csv);
}

const crawl_satellites = async (file_empty: boolean, filename = "output.csv", last_norad_id = 1) => {
	let satellites: Satellite[] = [];
	let norad_id = last_norad_id;

	// Writes only the header to the file.
	if (file_empty) write_to_file([], filename);

	let html = await fetch_satellite(norad_id);
	while (norad_id < 59507) {

		if (!html) {
			++norad_id;
			html = await fetch_satellite(norad_id);
			continue;
		}

		// Build Satellite Object from HTML
		const launch_date = get_launch_date(html);
		const decay_date = get_decay_date(html);
		const name = get_name(html).replace(",", ""); // Remove commas from the name as CSV uses ',' for seperator.
		const classification = get_classification(html);

		// Definition of Satellite: see util.ts.
		const satellite: Satellite = { name, norad_id, launch_date, decay_date, classification };
		satellites.push(satellite);
		append_to_file(satellite, filename);

		process.stdout.write(`\rNorad ID: ${norad_id}`);

		++norad_id;
		html = await fetch_satellite(norad_id);
	}
};

const get_last_norad_id = async (filename: string): Promise<number> => {
	const last_line = await readLastLines.read(filename, 1);
	return parseInt(last_line.split(",")[1]);
}

const main = async () => {
	if (!(await norad_up())) {
		console.error("N2YO is down.");
		return;
	}

	let filename = "satellite-dev.csv";
	let file_empty = true;
	if (fs.existsSync(filename)) file_empty = false;

	let last_norad_id = 1;
	if (!file_empty) {
		last_norad_id = await get_last_norad_id(filename);
		console.log(`Last Norad ID: ${last_norad_id}`);
	}

	await crawl_satellites(file_empty, filename, last_norad_id + 1);
};

main();

