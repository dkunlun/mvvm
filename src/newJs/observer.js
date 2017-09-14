function defineReactive(data, key, value) {
    observe(value)
    let dep = new Dep()
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: true,
        get () {
            if(Dep.target) {
                dep.depend()
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

let uid = 0

function Dep() {
    this.id = uid++
    this.subs = []
}

Dep.prototype = {
    addSub (sub) {
        this.subs.push(sub)
    },
    depend () {
        Dep.target.addDep(this)
    },
    removeSub (sub) {
        let index = this.subs.indexOf(sub)
        if(index !== -1) {
            this.subs.splice(index, 1)
        }
    },
    notify () {
        this.subs.forEach((sub) => {
            sub.update()
        })
    }
}

Dep.target = null
