const API: string = 'http://storageengine:8001';

const storeData = async (data: object, endpoint: string) => {
  try {
    const body = JSON.stringify(data);
    const response = await fetch(`${API}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    });

    // POST requests to NestJS always yield a 201 status code by default.
    if (response.status !== 201) {
      console.error('Failed to store data.');
      console.error(response.statusText);
      console.error(await response.text());
      process.exitCode = 1;
    }
  } catch (e) {
    // If error occurrs here for some reason, wait a bit and retry afterwards.
    console.warn('Failed to send data to database. Retrying ...');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await storeData(data, endpoint);
  }
};

const storePingData = async (data: object) => {
  await storeData(data, 'store/ping');
};

const storeDisconnectEventData = async (data: object) => {
  await storeData(data, 'store/disconnect_event');
};

const storeTracerouteData = async (data: object) => {
  await storeData(data, 'store/traceroute')
};

export { storePingData, storeDisconnectEventData, storeTracerouteData };
