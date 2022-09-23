export default class FocusLock {
  constructor({
    exception = false, container = 'body', mutationObserver = false,
  } = {}) {
    this._exception = exception;
    this._container = container;
    this._mutationObserver = mutationObserver;
  }

  _listElementsToBlock = new Set();

  _listChecksToBlock = [
    this._checkingForFocus,
    this._checkingForException.bind(this),
  ];

  _isBlockFocus = false;

  _linkOnMutationObserver;

  _listHandlesMutationObserver = {
    childList: this._handlesMutationChildList,
    attributes: this._handlesMutationAttributes,
  };

  _mutationAttributesFlag = false;

  isBlockFocus() {
    return this._isBlockFocus;
  }

  init() {
    this._throwsErrors();

    if (this._isTouchDevice()) return;

    setTimeout(() => {
      this._populatesTheListElementsToBlock(
        document.querySelectorAll(`${this._container} *`),
      );
    }, 0);

    this._addsMutationObserver();
  }

  _throwsErrors() {
    if (
      this._exception
      && !Array.isArray(this._exception)
      && typeof this._exception !== 'string'
    ) {
      throw new Error('Exception wrong type');
    }

    if (this._container && typeof this._container !== 'string') {
      throw new Error('Container wrong type');
    }
  }

  _isTouchDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i
      .test(navigator.userAgent);
  }

  _populatesTheListElementsToBlock(listElements) {
    listElements.forEach((element) => {
      if (this._checksOneElement(element)) {
        this._addsElementToBlockList(element);
      }
    });
  }

  _addsElementToBlockList(element) {
    this._listElementsToBlock.add(element);

    if (this.isBlockFocus()) {
      this._blocksFocusElement(element);
    }
  }

  _checksOneElement(element) {
    return this._listChecksToBlock.every((func) => func(element));
  }

  _checkingForFocus(element) {
    return element.tabIndex === 0;
  }

  _checkingForException(element) {
    if (!this._exception) {
      return true;
    }

    if (!Array.isArray(this._exception)) {
      return !element.closest(this._exception);
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const exception of this._exception) {
      if (element.closest(exception)) {
        return false;
      }
    }

    return true;
  }

  _blocksFocusElement(element) {
    element?.setAttribute('tabindex', -1);
  }

  blocksFocus() {
    this._listElementsToBlock.forEach((element) => {
      this._blocksFocusElement(element);
    });

    this._isBlockFocus = true;
    this._mutationAttributesFlag = true;
  }

  unblocksFocus() {
    this._listElementsToBlock.forEach((element) => {
      this._unblocksFocusElement(element);
    });

    this._isBlockFocus = false;
    setTimeout(() => {
      this._mutationAttributesFlag = false;
    });
  }

  _unblocksFocusElement(element) {
    element?.setAttribute('tabindex', 0);
  }

  _addsMutationObserver() {
    if (!this._mutationObserver) return;

    this._linkOnMutationObserver = new MutationObserver(
      this._handlesMutationObserver.bind(this),
    );

    this._linkOnMutationObserver.observe(document.querySelector(this._container), {
      childList: true,
      subtree: true,
      characterData: false,
      attributes: true,
      attributeFilter: ['tabindex'],
    });
  }

  _handlesMutationObserver(listMutation) {
    listMutation.forEach((mutation) => {
      const { type } = mutation;

      this._listHandlesMutationObserver[type].call(this, mutation);
    });
  }

  _handlesMutationChildList(mutation) {
    const { addedNodes, removedNodes } = mutation;
    const filteredAddedNodes = this._filtersElementsFromNodes(addedNodes);
    const filteredRemoveNodes = this._filtersElementsFromNodes(removedNodes);

    this._populatesTheListElementsToBlock(filteredAddedNodes);

    this._removesElementsFromBlockList(filteredRemoveNodes);
  }

  _filtersElementsFromNodes(nodes) {
    return Array.from(nodes).filter((node) => node.nodeType === 1);
  }

  _removesElementsFromBlockList(listElements) {
    listElements.forEach((element) => this._removesElementFromBlockList(element));
  }

  _removesElementFromBlockList(element) {
    this._listElementsToBlock.delete(element);

    if (this.isBlockFocus()) {
      this._unblocksFocusElement(element);
    }
  }

  _handlesMutationAttributes(mutation) {
    if (this._mutationAttributesFlag) return;

    const { target } = mutation;

    if (this._checksOneElement(target)) {
      this._addsElementToBlockList(target);

      return;
    }

    this._removesElementFromBlockList(target);
  }

  disconnectsMutationObserver() {
    this._linkOnMutationObserver.disconnect();
  }
}
