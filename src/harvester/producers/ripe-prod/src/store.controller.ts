const API: string = 'http://storageengine:8001';

const storeData = async (data: any, endpoint: string) => {
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
};

const storePingData = async (data: any) => {
  await storeData(data, 'store/ping');
};

const storeDisconnectEventData = async (data: any) => {
  await storeData(data, 'store/disconnect_event');
};

export { storePingData, storeDisconnectEventData };
