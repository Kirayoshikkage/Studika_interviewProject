import settings from './Settings.js';

async function getListCities() {
  const request = await fetch(settings.urlListCities, {
    method: 'POST',
  });
  const response = await request.json();

  return response;
}

export { getListCities };
