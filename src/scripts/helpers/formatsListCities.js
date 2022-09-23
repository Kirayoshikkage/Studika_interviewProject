export default function formatsListCities(listCities) {
  const result = [];

  listCities.forEach((area) => {
    const { name, cities = null } = area;

    result.push(
      Object.keys(area).reduce((acc, key) => {
        if (key !== 'cities') {
          acc[key] = area[key];
        }

        return acc;
      }, {}),
    );

    cities?.forEach((city) => result.push(Object.assign(city, {
      area: name,
    })));
  });

  return result;
}
