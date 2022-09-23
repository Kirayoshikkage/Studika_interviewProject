export default class SubstringWrapper {
  _elements;

  _substring;

  _listEvents = {
    updateSubstring: [],
  };

  on(event, cb) {
    this._listEvents[event].push(cb);
  }

  setSubstring(substring) {
    this._substring = substring;

    this._dispatchEvent('updateSubstring');
  }

  setElements(elements) {
    this._elements = elements;
  }

  _dispatchEvent(event) {
    this._listEvents[event].forEach((cb) => cb());
  }

  init() {
    this._initSubstringWrapperUpdate();
  }

  _initSubstringWrapperUpdate() {
    this.on('updateSubstring', () => {
      this._iteratesOverElements((element) => {
        this._wrapsSubstringOfElement(element);
      });
    });
  }

  _iteratesOverElements(cb) {
    Array.from(this._elements)?.forEach((element) => {
      cb(element);
    });
  }

  _wrapsSubstringOfElement(element) {
    const { textContent } = element;
    const startIndex = this._getStartIndexSubstring(textContent);
    const endIndex = this._getEndIndexSubstring(startIndex);

    if (startIndex < 0) {
      this._resetsWrapper(element, textContent);

      return;
    }

    const content = this._generatesContent(textContent, startIndex, endIndex);

    // eslint-disable-next-line no-param-reassign
    element.textContent = '';
    element.insertAdjacentHTML('beforeend', content);
  }

  _getStartIndexSubstring(textContent) {
    return textContent.toLowerCase().indexOf(this._substring.toLowerCase());
  }

  _getEndIndexSubstring(startIndex) {
    return startIndex >= 0 ? this._substring.length + startIndex : 0;
  }

  _resetsWrapper(element, textContent) {
    // eslint-disable-next-line no-param-reassign
    element.textContent = textContent;
  }

  _generatesContent(textContent, startIndex, endIndex) {
    // eslint-disable-next-line prefer-template
    return textContent.slice(0, startIndex)
      + `<span class="substring-wrapper">${textContent.slice(startIndex, endIndex)}</span>`
      + textContent.slice(endIndex);
  }
}
