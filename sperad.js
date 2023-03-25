function func() {
    console.log("Main bahr wala function hu");
    let a = 0;
    return () => {
        if (a < 1) {
            console.log("Hii mai andar ka function hu");
            a++;
        } else {
            console.log(" Main andar wala function, jisko 2 baar call hone se rokna tha, wo aready 1 baar call ho chuka hai.");
        }

    }
}

const va = func()
va()
va()
const va2 = func()
va2()
va2()