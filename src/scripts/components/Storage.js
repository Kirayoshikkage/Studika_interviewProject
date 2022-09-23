class Storage {
  _data = {};

  _formattingList = {};

  setData(key, data) {
    const formattingData = this._formatting(key, data);

    this._data[key] = formattingData;
  }

  getData(key) {
    return this._data[key];
  }

  setFormatting(key, fn) {
    this._formattingList[key] = fn;
  }

  _formatting(key, data) {
    if (this._formattingList[key]) {
      return this._formattingList[key](data);
    }

    return data;
  }
}

export default new Storage();
