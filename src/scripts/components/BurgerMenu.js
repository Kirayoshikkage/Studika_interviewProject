import debounce from '../helpers/debounce.js';

export default class BurgerMenu {
  constructor({
    container = null,
    body = null,
    trigger = null,
    breakpoints = null,
    animation = null,
    focusLock = null,
  } = {}) {
    this._container = document.querySelector(container);
    this._trigger = trigger ? document.querySelector(trigger) : null;
    this._body = body;

    this._animation = animation;
    this._focusLock = focusLock;
    this._breakpoints = breakpoints;
  }

  _currentBreakpoint;

  _isOpen = false;

  isOpen() {
    return this._isOpen;
  }

  init() {
    this._throwsError();

    this._addsEventListenersTrigger();

    this._closesWindowOnClickOutside();

    this._setsStyleHiding();

    this._initBreakpointUpdate();
  }

  _throwsError() {
    if (!this._body) {
      throw new Error('Field body is required');
    }
  }

  _addsEventListenersTrigger() {
    if (!this._trigger) return;

    this._trigger.addEventListener('pointerup', () => {
      this.toggle();
    });

    this._trigger.addEventListener('keydown', (e) => {
      if (e.code !== 'Enter') return;

      this.toggle();
    });
  }

  toggle() {
    if (!this.isOpen()) {
      this.open();

      return;
    }

    this.close();
  }

  open() {
    this._isOpen = true;

    this._addsPaddingInsteadOfScroll(document.body);

    this._addsPaddingInsteadOfScroll(this._container);

    this._setsStyleVisibility();

    this._switchesBlockScroll();

    this._switchesClassActiveTrigger();

    this._changesClassActiviteAtWindow();

    this._blocksFocus();
  }

  _addsPaddingInsteadOfScroll(element) {
    const padding = `${window.innerWidth - document.body.offsetWidth}px`;

    // eslint-disable-next-line no-param-reassign
    element.style.paddingRight = padding;
  }

  _setsStyleVisibility() {
    if (this._animation) {
      this._animation.setStyleVisibility(this._container);

      return;
    }

    this._container.style.visibility = 'visible';
    this._container.style.opacity = 1;
  }

  _switchesBlockScroll() {
    if (this.isOpen()) {
      document.body.classList.add('overflow-hidden');

      return;
    }

    document.body.classList.remove('overflow-hidden');
  }

  _switchesClassActiveTrigger() {
    if (!this._trigger) return;

    if (this._isOpen) {
      this._trigger.classList.add('active');

      return;
    }

    this._trigger.classList.remove('active');
  }

  _changesClassActiviteAtWindow() {
    if (this._isOpen) {
      this._container.classList.add('active');

      return;
    }

    this._container.classList.remove('active');
  }

  _blocksFocus() {
    if (!this._focusLock) return;

    this._focusLock.blocksFocus();
  }

  close() {
    this._isOpen = false;

    this._setsStyleHiding();

    this._switchesClassActiveTrigger();

    this._changesClassActiviteAtWindow();

    this._unblocksFocus();

    this._removesScrollPadding(document.body);

    this._removesScrollPadding(this._container);

    this._switchesBlockScroll();
  }

  _setsStyleHiding() {
    if (this._animation) {
      this._animation.setStyleHiding(this._container);

      return;
    }

    this._container.style.visibility = 'hidden';
    this._container.style.opacity = 0;
  }

  _unblocksFocus() {
    if (!this._focusLock) return;

    this._focusLock.unblocksFocus();
  }

  _removesScrollPadding(element) {
    // eslint-disable-next-line no-param-reassign
    element.style.paddingRight = 0;
  }

  _closesWindowOnClickOutside() {
    this._container.addEventListener('pointerdown', (e) => {
      if (e.target.closest(this._body)) return;

      this.close();
    });
  }

  _initBreakpointUpdate() {
    if (!this._breakpoints) return;

    this._updatesBreakpoint();

    window.addEventListener('resize', debounce(this._updatesBreakpoint.bind(this), 400));
  }

  _updatesBreakpoint() {
    const breakpoint = this._getCurrentBreakpoint();

    if (this._currentBreakpoint == breakpoint) return;

    this._currentBreakpoint = breakpoint;

    this._callsFunctionsBreakpoint();
  }

  _getCurrentBreakpoint() {
    const width = window.innerWidth;

    return Object.keys(this._breakpoints).reduce((acc, breakpoint) => {
      if (width >= breakpoint) {
        // eslint-disable-next-line no-param-reassign
        acc = breakpoint;
      }

      return acc;
    }, 0);
  }

  _callsFunctionsBreakpoint() {
    const functionsBreakpoint = this._breakpoints[this._currentBreakpoint];

    if (!functionsBreakpoint) return;

    if (typeof functionsBreakpoint === 'function') {
      functionsBreakpoint();

      return;
    }

    functionsBreakpoint?.forEach((func) => {
      func();
    });
  }
}
