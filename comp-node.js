export default class CompNode {
    constructor(val, children = [], op = "assign") {
        this.val = val;
        this.children = children;
        this.grad = 0;
        this.op = op;
        this.backwardProp = () => {
        };
        this.identity = crypto.randomUUID();
    }

    #toCompNode(obj) {
        if (!(obj instanceof CompNode)) {
            return new CompNode(obj);
        } else {
            return obj;
        }
    }

    sub(other) {
        other = this.#toCompNode(other);
        let out = new CompNode(this.val - other.val, [this, other], "sub");
        out.backwardProp = () => {
            this.grad += out.grad * 1;
            other.grad += out.grad * (-1);
        };

        return out;
    }

    add(other) {
        other = this.#toCompNode(other);
        let out = new CompNode(this.val + other.val, [this, other], "add");

        out.backwardProp = () => {
            this.grad += out.grad * 1;
            other.grad += out.grad * 1;
        };
        return out;
    }

    pow(exponent) {
        if (typeof exponent !== 'number') {
            throw new Error("Unsupported types");
        }
        let out = new CompNode(this.val ** exponent, [this], "pow");
        out.backwardProp = () => {
            this.grad += out.grad * exponent * this.val ** (exponent - 1);
        };
        return out;
    }

    mult(other) {
        other = this.#toCompNode(other);
        let out = new CompNode(this.val * other.val, [this, other], "mul");

        out.backwardProp = () => {
            this.grad += out.grad * other.val;
            other.grad += out.grad * this.val;
        };
        return out;
    }


    // for numeric comparison
    valueOf() {
        return this.val;
    }

    equals(other) {
        return this.val === other.val;
    }

    // no native way to override hash codes(we can build our own set interface to use this method)
    hashCode() {
        return parseInt(this.identity, 16);
    }

    toString() {
        return `op: ${this.op} | val: ${this.val.toFixed(4)} | children: ${this.children.length} | grad: ${this.grad}`;
    }

    topoSort(collectEdges = false) {
        let res = [];
        let visited = new Set();
        let edges = [];

        const visit = (node) => {
            if (!visited.has(node)) {
                visited.add(node);
                for (let child of node.children) {
                    if (collectEdges) {
                        edges.push([child, node]);
                    }
                    visit(child);
                }
                res.push(node);
            }
        };

        visit(this);

        if (collectEdges) {
            return [res, edges];
        }
        return res;
    }

    backward() {
        let nodes = this.topoSort();
        this.grad = 1;
        for (let i = nodes.length - 1; i >= 0; i--) {
            nodes[i].backwardProp();
        }
    }
}

console.assert(new CompNode(5).val === 5, 'Assignment Failed!');
console.assert(new CompNode(5).sub(new CompNode(3)).val === 2, 'Sub Failed!');
console.assert(new CompNode(5).sub(3).val === 2, 'Sub Failed!');
console.assert(new CompNode(5).pow(2).val === 25, 'Pow Failed')
console.assert(+new CompNode(3) === 3) //+new CompNode(3): + unary operator initiate a conversion form object to primitive
console.assert(+new CompNode(3) === +new CompNode(3))
console.assert(+new CompNode(5).mult(3) === 15, 'Mult Failed!');
