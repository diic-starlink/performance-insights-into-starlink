import express from 'express';
import { StoreController } from './store.controller';

const app = express();
const port = 8001;
// Parse request bodies as JSON
app.use(express.json({
	limit: '1mb'
}));

const main = async () => {
	await new Promise((resolve) => setTimeout(resolve, 5000));
	const storage_controller = new StoreController();
	await new Promise((resolve) => setTimeout(resolve, 2000));

	app.get('/', (_, res) => {
		res.send('Request should come via POST method.');
	});

	app.post('/', (_, res) => {
		res.send('1');
	});

	app.post('/store/ping', (req, res) => {
		storage_controller.storePingData(req, res);
	});

	app.post('/store/traceroute', (req, res) => {
		storage_controller.storeTracerouteData(req, res);
	});

	app.post('/store/satellite', (req, res) => {
		storage_controller.storeSatelliteData(req, res);
	});

	app.post('/store/disconnect_event', (req, res) => {
		storage_controller.storeDisconnectEventData(req, res);
	});

	app.listen(port, '0.0.0.0', () => {
		console.log(`Listening on port ${port}`);
	});
};

main();
