function Compile(el, vm) {
    this.$vm = vm
    this.$el = this.isElementNode(el) ? el : document.querySelector(el)

    if(this.$el) {
        this.$fragment = this.node2Fragment(this.$el)
        this.init()
        this.$el.appendChild(this.$fragment)
    }
}

Compile.prototype = {
    node2Fragment (el) {
        let fragment = document.createDocumentFragment()
        let child = null

        while (child = el.firstChild) {
            fragment.appendChild(child)
        }

        return fragment
    },
    init () {
        this.compileElement(this.$fragment)
    },
    compileElement (el) {
        let childNodes = el.childNodes

        [].slice.call(childNodes).forEach((node) => {
            let text = node.textContent
            let reg = /\{\{(.*)\}\}/

            if(this.isElementNode(node)) {
                this.compile(node)
            } else if (this.isTextNode(node) && reg.test(text)) {
                this.compileText(node, RegExp.$1)
            }

            if(node.childNodes && node.childNodes.length) {
                this.compileElement(node)
            }
        })
    },
    compile (node) {
        let nodeAttrs = node.attributes

        [].slice.call(nodeAttrs).forEach((attr) => {
            let attrName = attr.name
            if(this.isDirective(attrName)) {
                let exp = attr.value
                let dir = attrName.substring(2)

                if(this.isEventDirective(dir)) {
                    compileUtil.eventHandler(node, this.$vm, exp, dir)
                } else {
                    compileUtil[dir] && compileUtil[dir](node, this.$vm, exp)
                }

                node.removeAttribute(attrName)
            }
        })
    },
    compileText (node, exp) {
        compileUtil.text(node, this.$vm, exp)
    },
    isDirective (attr) {
        return attr.indexOf('v-') === 0
    },
    isElementNode (node) {
        return node.nodeType === 1
    },
    isTextNode (node) {
        return node.nodeType === 3
    }
}

let compileUtil = {
    text (node, vm, exp) {
        this.bind(node, vm, exp, 'text')
    },
    html (node, vm, exp) {
        this.bind(node, vm, exp, 'html')
    },
    model (node, vm, exp) {
        this.bind(node, vm, exp, 'model')
        let val = this._getVMVal(vm, exp)

        node.addEventListener('input', (e) => {
            let newValue = e.target.value
            if(val === newValue) {
                return
            }

            this._setVMVal(vm, exp, newValue)
            val = newValue
        })
    },
    class (node, vm, exp) {
        this.bind(node, vm, exp, 'class')
    },
    bind (node, vm, exp, dir) {
        var updaterFn = updater[dir + 'Updater']

        updaterFn && updaterFn(node, this._getVMVal(vm, exp))

        new Watcher(vm, exp, (value, oldValue) => {
            updaterFn && updaterFn(node, value, oldValue)
        })
    },
    eventHandler (node, vm, exp, dir) {
        let eventType = dir.split(':')[1]
        let fn = vm.$options.methods && vm.$options.methods[exp]

        if(eventType && fn) {
            node.addEventListener(eventType, fn.bind(vm), false)
        }
    },
    _getVMVal (vm, exp) {
        let val = vm
        exp = exp.split('.')
        exp.forEach((k) => {
            val = val[k]
        })

        return val
    },
    _setVMVal (vm, exp, value) {
        let val = vm
        exp = exp.split('.')
        exp.forEach((k, i) => {
            if(i < exp.length - 1) {
                val = val[k]
            } else {
                val[k] = value
            }
        })
    }
}

var updater = {
    textUpdater (node, value) {
        node.textContent = typeof value === 'undefined' ? '' : value
    },
    htmlUpdater (node, value) {
        node.innerHTML = typeof value === 'undefined' ? '' : value
    },
    classUpdater (node, value, oldValue) {
        let className = node.className
        className = className.replace(oldValue, '').replace(/\s$/, '')

        let space = className && String(value) ? ' ' : ''
        node.className = className + space + value
    },
    modelUpdater (node, value, oldValue) {
        node.value = typeof value === 'undefined' ? '' : value
    }
}
