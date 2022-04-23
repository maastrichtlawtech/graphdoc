
class Dog {
    name!: string;
    age!: number;

    constructor(options: {name: string, age: number}) {
        Object.assign(this, options)
    }

}

const dog = new Dog({name: 'Frank', age: 4})

console.log(dog)