const API: string = 'http://storageengine:8001';

const backendUp = async (): Promise<boolean> => {
  let response: Response;
  try {
    response = await fetch(API, {
      method: 'POST'
    });
  } catch (e) {
    return false;
  }
  return response.status <= 201;
};

const storeData = async (data: object, endpoint: string) => {
  if (!data) return;
  while (!backendUp) await new Promise((resolve) => setTimeout(resolve, 2000));

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
    if (response.status > 201) {
      console.error('Failed to store data.');
      console.error(response.statusText);
      console.error(await response.text());
      process.exitCode = 1;
    }
  } catch (e) {
    console.warn('Failed to send data to database.');
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
