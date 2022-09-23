import debounce from '../helpers/debounce.js';

export default class Filter {
  constructor({
    elements,
    input,
    filterResetButton = null,
    filterField,
    animation,
  }) {
    this._elements = elements;
    this._input = input;
    this._filterResetButton = filterResetButton;
    this._filterField = filterField;

    this._animation = animation;

    this._filteredElements = elements;
  }

  _filter = '';

  _listEvents = {
    changeFilter: [],
    beforeFiltering: [],
  };

  on(event, cb) {
    this._listEvents[event].push(cb);
  }

  getFilteredElements() {
    return this._filteredElements;
  }

  init() {
    this._initInput();

    this._initElementFiltering();

    this._initFilterResetButton();
  }

  _initInput() {
    this._setsEventListenerOnTheInput();

    this.on('changeFilter', (filter) => {
      this._input.value = filter;
    });
  }

  _setsEventListenerOnTheInput() {
    this._input.addEventListener('input', debounce(() => {
      const { value } = this._input;

      this._filter = this._formatsInputValue(value);

      this._dispatchEvent('changeFilter', this._filter);
    }, 400));
  }

  _formatsInputValue(value) {
    return value.trim();
  }

  _dispatchEvent(event, data) {
    this._listEvents[event]?.forEach((cb) => cb(data));
  }

  _initElementFiltering() {
    this.on('changeFilter', this._filtersElements.bind(this));
  }

  _filtersElements() {
    this._dispatchEvent('beforeFiltering');

    this._filteredElements = [];

    Array.from(this._elements)?.forEach((element) => {
      const filterFieldValue = element.dataset[this._filterField];

      if (!filterFieldValue) return;

      if (this._checksForMatchWithFilter(filterFieldValue)) {
        this._setsStyleVisibility(element);

        this._filteredElements.push(element);

        return;
      }

      this._setsStyleHiding(element);
    });
  }

  _checksForMatchWithFilter(filterFieldValue) {
    return filterFieldValue.toLowerCase().includes(this._filter.toLowerCase());
  }

  _setsStyleHiding(element) {
    if (this._animation) {
      this._animation.setsStyleHiding(element);

      return;
    }

    // eslint-disable-next-line no-param-reassign
    element.style.display = 'none';
  }

  _setsStyleVisibility(element) {
    if (this._animation) {
      this._animation.setsStyleVisibility(element);

      return;
    }

    // eslint-disable-next-line no-param-reassign
    element.style.display = 'block';
  }

  _initFilterResetButton() {
    if (!this._filterResetButton) return;

    this._setsEventListenerOnResetBtn();

    this._setsStyleHiding(this._filterResetButton);

    this.on('changeFilter', this._changesVisibilityButton.bind(this));
  }

  _setsEventListenerOnResetBtn() {
    this._filterResetButton.addEventListener('pointerup', () => {
      this._filter = '';

      this._dispatchEvent('changeFilter', this._filter);
    });

    this._filterResetButton.addEventListener('keydown', (e) => {
      const { code } = e;

      if (code !== 'Enter') return;

      this._filter = '';

      this._dispatchEvent('changeFilter', this._filter);
    });
  }

  _changesVisibilityButton() {
    if (this._filter === '') {
      this._setsStyleHiding(this._filterResetButton);

      return;
    }

    this._setsStyleVisibility(this._filterResetButton);
  }
}
