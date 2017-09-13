function defineReactive(data, key, value) {
    observe(value)
    let dep = new Dep()
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: true,
        get () {
            if(Dep.target) {
                dep.addSub(Dep.target)
            }
            return value
        },
        set (newVal) {
            if(value === newVal) {
                return
            }
            value = newVal
            dep.notify()
        }
    })
}

function observe(data) {
    if (!data || typeof data !== 'object') {
        return;
    }
    Object.keys(data).forEach(function(key) {
        defineReactive(data, key, data[key]);
    });
};

function Dep() {
    this.subs = []
}

Dep.prototype = {
    addSub (sub) {
        this.subs.push(sub)
    },
    notify () {
        this.subs.forEach((sub) => {
            sub.update()
        })
    }
}

Dep.target = null
