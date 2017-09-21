function MVVM(options) {
    this.$options = options || {}
    let data = this.data = this.$options.data

    Object.keys(data).forEach(key => {
        this._proxyData(key)
    })

    this._initComputed()

    observe(data)

    this.$compile = new Compile(options.el || document.body, this)
}

MVVM.prototype = {
    //代理数据
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
    },
    _initComputed () {
        let computed = this.$options.computed
        if(typeof computed === 'object') {
            Object.keys(computed).forEach(key => {
                 Object.defineProperty(this, key, {
                     get: typeof computed[key] === 'function'
                            ? computed[key]
                            : computed[key].get,
                    set: function () {

                    }
                 })
            })
        }
    }
}
