export default class DropdownContent {
  constructor(container, {
    animation = null,
    focusLock = null,
  } = {}) {
    this._container = document.querySelector(container);
    this._trigger = this._container.querySelector('.dropdown-content__trigger');
    this._body = this._container.querySelector('.dropdown-content__body');
    this._content = this._container.querySelector('.dropdown-content__content');

    this._animation = animation;
    this._focusLock = focusLock;
  }

  _isOpen = false;

  _eventsList = {
    open: [],
    close: [],
  };

  isOpen() {
    return this._isOpen;
  }

  on(event, cb) {
    this._eventsList[event].push(cb);
  }

  init() {
    this.close();

    this._setsEventListenersTrigger();

    this._closesOnClickOutsideDropdownContent();
  }

  close() {
    this._isOpen = false;

    this._setsStyleHiding();

    this._removesClassActiviteAtContainer();

    this._unblocksFocus();

    this._dispatchEvent('close');
  }

  _setsStyleHiding() {
    if (this._animation) {
      this._animation.setsStyleHiding(this._container);

      return;
    }

    this._body.style.display = 'none';
  }

  _removesClassActiviteAtContainer() {
    this._container.classList.remove('active');
  }

  _unblocksFocus() {
    if (!this._focusLock) return;

    this._focusLock.unblocksFocus();
  }

  _dispatchEvent(event) {
    this._eventsList[event]?.forEach((cb) => cb());
  }

  _setsEventListenersTrigger() {
    this._trigger.addEventListener('pointerup', this._toggle.bind(this));

    this._trigger.addEventListener('keydown', (e) => {
      if (e.code !== 'Enter') return;

      this._toggle();
    });
  }

  _toggle() {
    if (this._isOpen) {
      this.close();

      return;
    }

    this.open();
  }

  open() {
    this._isOpen = true;

    this._setsStyleVisibility();

    this._addsClassActiviteContainer();

    this._blocksFocus();

    this._dispatchEvent('open');
  }

  _setsStyleVisibility() {
    if (this._animation) {
      this._animation.setsStyleVisibility(this._container);

      return;
    }

    this._body.style.display = 'block';
  }

  _addsClassActiviteContainer() {
    this._container.classList.add('active');
  }

  _blocksFocus() {
    if (!this._focusLock) return;

    this._focusLock.blocksFocus();
  }

  _closesOnClickOutsideDropdownContent() {
    document.addEventListener('pointerup', (e) => {
      if (!this.isOpen()) return;

      const { target } = e;

      if (target.closest('.dropdown-content')) return;

      this.close();
    });
  }
}
