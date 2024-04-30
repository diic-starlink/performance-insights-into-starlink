import { execSync } from "child_process"
import { existsSync, mkdirSync, readFileSync, open, rmSync } from "fs";

/**
 * Finds a filename in the form 'temp_cached_fileN' where N is the smallest number such that 'temp_cached_fileN' as a file does not exist.
 */
const find_directory = (): string => {
	const basename = process.cwd() + '/temp_cached_file';
	let i = 0;
	while (existsSync(basename + i)) ++i;
	return basename + i;
}


/**
 * Fetches a large amount of data from a URL.
 * Is designed for fetching more than 0x1fffffe8 characters (which is the maximum for creating a single string in JavaScript).
 *
 * Downloads the specified URL to a temporary file using wget and then reads the file into a JSON object.
 */
const large_fetch = async (url: string): Promise<Object[]> => {
	const dir = find_directory();
	mkdirSync(dir);

	// Create the file
	const out_filename = dir + '/data.json';
	open(out_filename, 'w', (err, file) => {
		console.error(`Could not write ${file}.\n${err}`);
		process.exit(1);
	});

	console.log(`Fetching data from ${url}...`);
	execSync(`wget -O ${out_filename} ${url}`);
	const out = readFileSync(out_filename, 'utf-8');
	console.log(`Fetched data from ${url}. Processing into JSON...`);
	const out_json = JSON.parse(out);
	console.log(`Processed data from ${url}. Cleaning up...`);

	rmSync(dir, { recursive: true, force: true });
	return out_json;
}

export { large_fetch };
