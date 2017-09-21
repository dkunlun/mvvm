/**
 * 编译器
 * @param       {dom} el 绑定节点
 * @param       {object} vm 实列对象
 */
function Compile(el, vm) {
    this.vm = vm
    this.el = document.querySelector(el)
    this.fragment = null
    this.init()
}

Compile.prototype = {
    init () {
        if(this.el) {
            this.fragment = this.nodeToFragment(this.el)
            this.compileElement(this.fragment)
            this.el.appendChild(this.fragment)
        } else {
            console.log('Dom元素不存在')
        }
    },
    nodeToFragment (el) {
        let fragment = document.createDocumentFragment()
        let child = el.firstChild
        while (child) {
            fragment.appendChild(child)
            child = el.firstChild
        }

        return fragment
    },
    compileElement (el) {
        let childNodes = el.childNodes

        Array.prototype.slice.call(childNodes).forEach((node) => {
            let reg = /\{\{(.*)\}\}/
            let text = node.textContent

            if(this.isElementNode(node)) {
                this.compile(node)
            } else if(this.isTextNode(node) && reg.test(text)) {
                this.compileText(node, reg.exec(text)[1])
            }

            if(node.childNodes && node.childNodes.length) {
                this.compileElement(node)
            }
        })
    },
    compileText(node, exp) {
        compileUtil.text(node, this.vm, exp)
    },
    compile (node) {
        let nodeAttrs = node.attributes

        Array.prototype.slice.call(nodeAttrs).forEach((attr) => {
            let attrName = attr.name

            if(this.isDirective(attrName)) {
                let exp = attr.value
                let dir = attrName.substring(2)
                if(this.isEventDirective(dir)) {
                    this.compileEvent(node, this.vm, exp, dir)
                } else {
                    compileUtil[dir] && compileUtil[dir](node, this.vm, exp)
                }
                node.removeAttribute(attrName)
            }
        })
    },
    compileEvent (node, vm, exp, dir) {
        let eventType = dir.split(':')[1]
        let cb = vm.$options.methods && vm.$options.methods[exp]

        if(eventType && cb) {
            node.addEventListener(eventType, cb.bind(vm), false)
        }
    },
    updateText (node, value) {
        node.textContent = typeof value == 'undefined' ? '' : value;
    },
    modelUpdater (node, value, oldValue) {
        node.value = typeof value == 'undefined' ? '' : value
    },
    isTextNode (node) {
        return node.nodeType == 3
    },
    isElementNode (node) {
        return node.nodeType == 1
    },
    isDirective (attr) {
        return attr.indexOf('v-') === 0
    },
    isEventDirective (dir) {
        return dir.indexOf('on:') === 0
    }
}

let compileUtil = {
    text (node, vm, exp) {
        this.bind(node, vm, exp, 'text')
    },
    bind (node, vm, exp, dir) {
        let updaterFn = updater[dir + 'Updater']

        updaterFn && updaterFn(node, this._getVMVal(vm, exp))

        new Watcher(vm, exp, (value, oldValue) => {
            updaterFn && updaterFn(node, value, oldValue)
        })
    },
    model (node, vm, exp) {
        this.bind(node, vm, exp, 'model')
        let val = this._getVMVal(vm, exp)

        node.addEventListener('input', e => {
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
    _getVMVal (vm, exp) {
        let val = vm
        exp = exp.split('.')
        exp.forEach(k => {
            val = val[k]
        })

        return val
    },
    _setVMVal (vm, exp, value) {
        let val = vm
        exp = exp.split('.')
        exp.forEach((k, i) =>{
            if(i < exp.length - 1) {
                val = val[k]
            } else {
                val[k] = value
            }
        })
    }
}

let updater = {
    textUpdater (node, value) {
        node.textContent = typeof value === 'undefined' ? '' : value
    },
    htmlUpdater (node, value) {
        node.innerHTML = typeof value === 'undefined' ? '' : value
    },
    classUpdater (node, value, oldValue) {
        let classList = node.classList
        oldValue && classList.remove(oldValue)
        value && classList.add(value)
    },
    modelUpdater (node, value, oldValue) {
        node.value = typeof value === 'undefined' ? '' : value
    }
}
