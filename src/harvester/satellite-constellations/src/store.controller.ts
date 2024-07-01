const API: string = 'http://storageengine:8001';

/**
 * Store data in the database.
 *
 * @param data The data to store in object (not string) format.
 * @param endpoint The endpoint to store the data in. Does not have a leading slash.
 */
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

export { storeData };
