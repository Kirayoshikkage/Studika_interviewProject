/* eslint-disable no-alert */
import SimpleBar from 'simplebar';
import storage from './Storage.js';
import { getListCities } from './Api.js';
import render from '../helpers/render.js';
import DropdownContent from './DropdownContent.js';
import FocusLock from './FocusLock.js';
import formatsListCities from '../helpers/formatsListCities.js';
import Filter from './Filter.js';
import Widgets from './Widgets.js';
import convertsListCitiesInDOMElements from '../helpers/convertsListCitiesInDOMElements.js';
import sendsSelectedCities from '../helpers/sendsSelectedCities.js';
import SubstringWrapper from './SubstringWrapper.js';

export default function initCitySelection() {
  const selectorCitySelection = '.city-selection';
  const citySelection = document.querySelector(selectorCitySelection);
  const bodyCitySelection = citySelection.querySelector('.dropdown-content__body');
  const selectorContainerListOfCities = '.city-selection__cities';
  const containerListOfCities = citySelection.querySelector(selectorContainerListOfCities);
  const listOfCities = citySelection.getElementsByClassName('city-selection__city');
  const elementsOutputNameCity = citySelection.getElementsByClassName('city-selection__city-name');
  const inputFilter = citySelection.querySelector('.form__input');
  const btnResetFilter = citySelection.querySelector('.filter__reset');
  const containerWidgets = citySelection.querySelector('.city-selection__widgets');
  const btnSaveCitySelection = citySelection.querySelector('.city-selection__save');

  let navigationIndex = 0;

  // Блокировка фокуса
  const focusLock = new FocusLock({
    exception: selectorCitySelection,
    mutationObserver: true,
  });
  focusLock.init();

  // Кастомный скролл
  const customScrollbar = new SimpleBar(containerListOfCities);
  const custromScrollbarWrapper = citySelection.querySelector('.simplebar-content-wrapper');
  custromScrollbarWrapper?.setAttribute('tabindex', -1);

  // Выпадающий контент
  const dropdownContent = new DropdownContent(
    selectorCitySelection,
    {
      focusLock,
      animation: {
        setsStyleHiding(container) {
          const body = container.querySelector('.dropdown-content__body');

          body.style.visibility = 'hidden';
        },
        setsStyleVisibility(container) {
          const body = container.querySelector('.dropdown-content__body');

          body.style.visibility = 'visible';
        },
      },
    },
  );
  dropdownContent.init();
  dropdownContent.on('open', async () => {
    if (storage.getData('listCities')) return;

    try {
      bodyCitySelection.classList.add('preloader');
      const listCities = await getListCities();

      storage.setFormatting('listCities', formatsListCities);
      storage.setData('listCities', listCities);

      const elements = convertsListCitiesInDOMElements(
        storage.getData('listCities'),
      );
      render(containerListOfCities.querySelector('.simplebar-content'), elements);
    } catch (error) {
      alert('Возникла ошибка, попробуйте еще раз!');

      dropdownContent.close();
    } finally {
      bodyCitySelection.classList.remove('preloader');
    }
  });

  // Обертка подстроки
  const substringWrapper = new SubstringWrapper();
  substringWrapper.init();
  substringWrapper.setElements(elementsOutputNameCity);

  // Фильтр
  const filterCitySelection = new Filter({
    elements: listOfCities,
    input: inputFilter,
    filterField: 'city',
    filterResetButton: btnResetFilter,
  });
  filterCitySelection.init();
  filterCitySelection.on('changeFilter', (filter) => {
    substringWrapper.setSubstring(filter);
  });

  // Виджеты
  const widgetsCitySelection = new Widgets(
    containerWidgets,
  );
  widgetsCitySelection.init();
  widgetsCitySelection.on('addWidget', (id) => {
    const city = containerListOfCities.querySelector(`[data-id='${id}']`);

    city?.classList.add('active');
  });
  widgetsCitySelection.on('deleteWidget', (id) => {
    const city = containerListOfCities.querySelector(`[data-id='${id}']`);

    city?.classList.remove('active');
  });

  // Навигация по списку
  filterCitySelection.on('beforeFiltering', () => {
    const elements = filterCitySelection.getFilteredElements();

    elements[navigationIndex].setAttribute('tabindex', -1);
  });
  filterCitySelection.on('changeFilter', () => {
    const elements = filterCitySelection.getFilteredElements();

    navigationIndex = 0;
    elements[navigationIndex].setAttribute('tabindex', 0);
  });

  function navigatesDownTheCities() {
    const elements = filterCitySelection.getFilteredElements();

    if (navigationIndex === elements.length - 1) return;

    elements[navigationIndex]?.setAttribute('tabindex', -1);
    navigationIndex += 1;
    elements[navigationIndex].setAttribute('tabindex', 0);
    elements[navigationIndex].focus();
  }

  function navigatesUpTheCities() {
    const elements = filterCitySelection.getFilteredElements();

    if (navigationIndex === 0) return;

    elements[navigationIndex]?.setAttribute('tabindex', -1);
    navigationIndex -= 1;
    elements[navigationIndex].setAttribute('tabindex', 0);
    elements[navigationIndex].focus();
  }

  function adjustsNavigationIndex(element) {
    const elements = filterCitySelection.getFilteredElements();

    elements[navigationIndex].setAttribute('tabindex', -1);
    navigationIndex = Array.from(elements).indexOf(element);
    elements[navigationIndex].setAttribute('tabindex', 0);
  }

  containerListOfCities.addEventListener('pointerup', (e) => {
    const { target } = e;
    const cityElement = target.closest('.city-selection__city');

    if (!cityElement) return;

    const { id, city } = cityElement.dataset;

    adjustsNavigationIndex(cityElement);

    if (widgetsCitySelection.hasWidget(id)) {
      widgetsCitySelection.deletesWidget(id);

      return;
    }

    widgetsCitySelection.addsWidget(city, id);
  });
  containerListOfCities.addEventListener('keydown', (e) => {
    const { target, code } = e;
    const cityElement = target.closest('.city-selection__city');

    if (!cityElement || code !== 'Enter') return;

    const { id, city } = cityElement.dataset;

    if (widgetsCitySelection.hasWidget(id)) {
      widgetsCitySelection.deletesWidget(id);

      return;
    }

    widgetsCitySelection.addsWidget(city, id);
  });
  containerListOfCities.addEventListener('keydown', (e) => {
    const { code } = e;

    if (code !== 'ArrowDown') return;

    e.preventDefault();

    navigatesDownTheCities();
  });
  containerListOfCities.addEventListener('keydown', (e) => {
    const { code } = e;

    if (code !== 'ArrowUp') return;

    e.preventDefault();

    navigatesUpTheCities();
  });
  containerListOfCities.addEventListener('focus', () => {
    const elements = filterCitySelection.getFilteredElements();

    elements[navigationIndex].setAttribute('tabindex', 0);
    containerListOfCities.setAttribute('tabindex', -1);
    elements[navigationIndex].focus();
  }, {
    once: true,
  });

  // Отправка выбранных городов

  btnSaveCitySelection.addEventListener('pointerup', () => {
    sendsSelectedCities(widgetsCitySelection.getWidgets())
      .then(() => {
        dropdownContent.close();

        alert('Успешно!');
      })
      .catch(() => alert('Вы не выбрали ни одного города!'));
  });
  btnSaveCitySelection.addEventListener('keydown', (e) => {
    const { code } = e;

    if (code !== 'Enter') return;

    sendsSelectedCities(widgetsCitySelection.getWidgets())
      .then(() => {
        dropdownContent.close();

        alert('Успешно!');
      })
      .catch(() => alert('Вы не выбрали ни одного города!'));
  });
}
