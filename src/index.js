import MVVM from './core/mvvm'

var vm = new MVVM({
    el: '#mvvm-app',
    data: {
        name: 123,
        age: 19,
        friends: [
            {
                name: 'bob',
                age: 19
            }
        ]
    },
    methods: {
        add () {
            this.age++
        }
    }
})
