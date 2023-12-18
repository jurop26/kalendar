function funct1() {
    return new Promise(resolve => setTimeout(() => resolve("funct1"),3000))
}

function funct2() {
    console.log("funct2")
    // return new Promise(resolve => setTimeout(() => resolve("funct2"),3000))
}

async function funct3() {
    try{
        const wait1 = await funct1()
        console.log(wait1)
        funct2()
        // const wait2 = await funct2()
        // console.log(wait2)

    } catch(err) {
        console.error(err)
    }
}

funct3()