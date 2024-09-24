const express = require('express');
const bodyParser = require('body-parser');
const pg = require('pg');

const pool = new pg.Pool({
	user: 'postgres',
	password: 'postgres',
	host: 'vm-robert-richter.cloud.dhclab.i.hpi.de',
	port: 5432,
	database: 'postgres'
});

const get_latency_data = async () => {
	const latency_query = `
		SELECT * FROM tls_data td JOIN ripe_atlas_probe_data rapd ON td.prb_id = rapd.id
		WHERE timestamp > 1704067200 and timestamp < 1706745600;
	`;
	const res = pool.query(latency_query);
	return res;
};

const app = express();
const port = 8889;

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(express.static("public"));

app.get('/latency', async (_, res) => {
	const latency_data = await get_latency_data();
	if (latency_data) {
		res.writeHead(200, {
			'Content-Type': 'text/json'
		});
		res.end(JSON.stringify(latency_data.rows));
		return;
	}

	res.writeHead(500);
	res.end('Internal server error');
});

app.get('/robots.txt', (_, res) => {
	res.writeHead(200);
	res.end('This API might not be crawled by unauthorized parties.');
});

app.listen(port, () => {
	console.log(`Server started on port ${port}.`)
});
