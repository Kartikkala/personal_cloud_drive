function call(callback) {

    if (typeof callback != typeof call) {
        console.log("First argument must be a callback function");
    } else {

        callback();
    }

}

function hello() {
    console.log("Hello");
}

function wish(name) {
    console.log(`Hello ${name}`);
}


call(wish);