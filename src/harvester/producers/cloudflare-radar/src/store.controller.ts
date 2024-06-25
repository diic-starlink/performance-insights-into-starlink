const API: string = 'http://storageengine:8001/store/ping';

const storePingData = async (data: object) => {
  const body = JSON.stringify(data);
  const response = await fetch(API, {
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
}

export { storePingData };
