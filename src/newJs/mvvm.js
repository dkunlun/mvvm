function MVVM (options) {
    this.$options = options || {}
    let data = this._data = this.$options.data

    Object.keys(data).forEach(key => {
        this._proxyData(key)
    })
    new Observer(data)
}

MVVM.prototype = {
    _proxyData (key) {
        let me = this

        Object.defineProperty(this, key, {
            configurable: false,
            enumerable: true,
            get: function () {
                return me._data[key]
            },
            set: function (newVal) {
                me._data[key] = newVal
            }
        })
    }
}
