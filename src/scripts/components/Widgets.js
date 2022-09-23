export default class Widgets {
  constructor(container, {
    renderFunction = null,
  } = {}) {
    this._container = container;
    this._renderFunction = renderFunction;
  }

  _listWidgets = new Map();

  _eventsList = {
    addWidget: [],
    deleteWidget: [],
  };

  on(event, cb) {
    this._eventsList[event].push(cb);
  }

  getWidgets() {
    return [...this._listWidgets.values()];
  }

  hasWidget(id) {
    return this._listWidgets.has(id);
  }

  init() {
    this._setsEventListenerOnWidgets();
  }

  _setsEventListenerOnWidgets() {
    this._container.addEventListener('pointerup', (e) => {
      e.stopPropagation();

      const { target } = e;

      if (!target.closest('.widget__remove')) return;

      const { id } = target.closest('.widget').dataset;

      this.deletesWidget(id);
    });

    this._container.addEventListener('keydown', ({ target, code }) => {
      if (code !== 'Enter' || !target.closest('.widget__remove')) return;

      const { id } = target.closest('.widget').dataset;

      this.deletesWidget(id);
    });
  }

  deletesWidget(id) {
    this._removesWidgetFromHTML(id);

    this._listWidgets.delete(id);

    this._dispatchEvent('deleteWidget', id);
  }

  _removesWidgetFromHTML(id) {
    this._container.querySelector(`[data-id='${id}']`)?.remove();
  }

  _dispatchEvent(event, data) {
    this._eventsList[event]?.forEach((cb) => cb(data));
  }

  addsWidget(name, id) {
    if (this._listWidgets.has(id)) return;

    this._addsWidgetInHTML(name, id);

    this._listWidgets.set(id, {
      name,
      id,
    });

    this._dispatchEvent('addWidget', id);
  }

  _addsWidgetInHTML(name, id) {
    const widgetElement = this._createsWidget(name, id);

    this._insertsWidgetInContainer(widgetElement);
  }

  _createsWidget(name, id) {
    if (this._renderFunction) {
      return this._renderFunction(name, id);
    }

    return `
      <li class="widget" data-id='${id}'>
        <span class="widget__name">
          ${name}
        </span>
        <button class="btn-reset widget__remove" aria-label="Удаление виджета" role="widget">
          <svg class="widget__icon">
            <use xlink:href="img/sprite.svg#close-icon"></use>
          </svg>
        </button>
      </li>
    `;
  }

  _insertsWidgetInContainer(widget) {
    this._container.insertAdjacentHTML('beforeend', widget);
  }
}
