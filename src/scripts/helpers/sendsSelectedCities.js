import setCookie from './setCookie.js';

export default function sendsSelectedCities(cities) {
  return new Promise((resolve, reject) => {
    if (!cities.length) {
      reject();

      return;
    }

    const idCities = cities.reduce((acc, city) => {
      const { id } = city;

      acc.push(id);

      return acc;
    }, []);
    const strId = idCities.join(',');

    setCookie('cities', strId, {
      samesite: 'lax', path: '/', secure: true, 'max-age': 3600,
    });

    fetch('http://localhost:8080/');

    resolve();
  });
}
