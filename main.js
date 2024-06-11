import CompNode from "./comp-node.js";

function generatePoints(N = 1000) {
    const lst_x = [];
    const lst_y = [];
    for (let i = 0; i < N; i++) {
        lst_x.push(Math.random());
        lst_y.push(Math.random());
    }
    return [lst_x, lst_y];
}

function calcGrad(x_p, y_p, batch_x, batch_y) {
    let sum_x = 0;
    let sum_y = 0;
    let x_i = 0, y_i = 0, inv_sqrt = 0;
    for (let i = 0; i < batch_x.length; i++) {
        x_i = batch_x[i];
        y_i = batch_y[i];
        inv_sqrt = ((x_i - x_p) ** 2 + (y_i - y_p) ** 2) ** -0.5
        sum_x += inv_sqrt * (x_i - x_p);
        sum_y += inv_sqrt * (y_i - y_p);
    }

    return [-sum_x / batch_x.length, -sum_y / batch_x.length];
}

function loss(x_p, y_p, batch_x, batch_y) {
    let total = 0;
    let xi = 0, yi = 0;
    for (let i = 0; i < batch_x.length; i++) {
        xi = batch_x[i];
        yi = batch_y[i];
        total += ((xi - x_p) ** 2 + (yi - y_p) ** 2) ** 0.5
    }
    return total / batch_x.length;
}


function lossGraph(x_p, y_p, data_x, data_y) {
    let loss = new CompNode(0);
    let xi = 0, yi = 0;
    for (let i = 0; i < data_x.length; i++) {
        xi = data_x[i];
        yi = data_y[i];
        let Ix = x_p.sub(xi), Iy = y_p.sub(yi);
        let gx = Ix.pow(2), gy = Iy.pow(2);
        let M = gx.add(gy);
        let l = M.pow(0.5);
        loss = loss.add(l);
    }
    return loss.mult(1 / data_x.length)
}

function main() {

    let x_p = 0.3, y_p = 0.3;
    let [data_x, data_y] = generatePoints(1000);
    let [grad_x, grad_y] = calcGrad(x_p, y_p, data_x, data_y);
    let cur_loss = loss(x_p, y_p, data_x, data_y)

    console.log(`CLOSED FORM:`);
    console.log(`gradient for x_p ${grad_x}, gradient for y_p ${grad_y}`);
    console.log(`current loss: ${cur_loss}`);


    x_p = new CompNode(0.3);
    y_p = new CompNode(0.3);

    cur_loss = lossGraph(x_p, y_p, data_x, data_y);
    cur_loss.backward();
    console.log(`AUTOGRAD ENGINE:`);
    console.log(`${x_p}\n${y_p}`);
    console.log(`current loss: ${cur_loss}`);

    // let nodes = cur_loss.topoSort();
    // for (let i = nodes.length - 1; i >= 0; i--) {
    //         console.log(nodes[i])
    // }
}

main();



