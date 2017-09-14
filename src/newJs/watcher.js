function Watcher(vm, exp, cb) {
    this.cb = cb
    this.vm = vm
    this.exp = exp
    this.depIds = {}

    this.value = this.get()
}

Watcher.prototype = {
    update () {
        this.run()
    },
    addDep (dep) {
        if(!this.depIds.hasOwnProperty(dep.id)) {
            dep.addSub(this)
            this.depIds[dep.id] = dep
        }
    },
    run () {
        let value = this.vm.data[this.exp]
        let oldVal = this.value
        if(value !== oldVal) {
            this.value = value
            this.cb.call(this.vm, value, oldVal)
        }
    },
    get () {
        Dep.target = this
        let value = this.vm.data[this.exp]
        Dep.target = null
        return value
    }
}
