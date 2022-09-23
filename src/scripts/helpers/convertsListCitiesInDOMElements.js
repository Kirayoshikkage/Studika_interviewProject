export default function convertsListCitiesInDOMElements(listCities) {
  let fragment = '';

  listCities.forEach((city) => {
    const {
      id, name, area = null,
    } = city;

    fragment += `
      <li class="city-selection__item">
        <button class="btn-reset city-selection__city" data-id="${id}" data-city="${name}" tabindex="-1">
          <span class="city-selection__city-name">
            ${name}
          </span>
          ${area ? `<small>${area}</small>` : ''}
        </button>
      </li>
    `;
  });

  return fragment;
}
