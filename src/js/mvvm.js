function MVVM(options) {
    this.$options = options || {}
    let data = this._data = this.$options.data

    Object.keys(data).forEach((key) => {
        this._proxyData(key)
    })

    this._initComputed()

    observe(data, this)

    this.$compile = new Compile(options.el || document.body, this)
}

MVVM.prototype = {
    $watch (key, cb, options) {
        new Watcher(this, key, cb)
    },
    _proxyData: function(key, setter, getter) {
        var me = this;
        setter = setter ||
        Object.defineProperty(me, key, {
            configurable: false,
            enumerable: true,
            get: function proxyGetter() {
                return me._data[key];
            },
            set: function proxySetter(newVal) {
                me._data[key] = newVal;
            }
        });
    },

    _initComputed: function() {
        var me = this;
        var computed = this.$options.computed;
        if (typeof computed === 'object') {
            Object.keys(computed).forEach(function(key) {
                Object.defineProperty(me, key, {
                    get: typeof computed[key] === 'function'
                            ? computed[key]
                            : computed[key].get,
                    set: function() {}
                });
            });
        }
    }
}
