function MVVM(options) {
    this.$options = options || {}
    let data = this.data = this.$options.data

    Object.keys(data).forEach(key => {
        this._proxyData(key)
    })

    observe(data)

    new Compile(options.el, this)

    return this
}

MVVM.prototype = {
    _proxyData (key) {
        Object.defineProperty(this, key, {
            enumerable: false,
            configurable: true,
            get () {
                return this.data[key]
            },
            set (newVal) {
                this.data[key] = newVal
            }
        })
    }
}
