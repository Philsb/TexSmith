import { Interpolation } from "./mathUtils";

const NormalizeRanges = (arr: any[]) => {
    let arrSize = arr.length;

    let minNum = Number.MAX_VALUE;
    let maxNum = Number.MIN_VALUE;

    let index = 0;
    while (index < arrSize) {
        if (arr[index] < minNum)
            minNum = arr[index];
        if (arr[index] > maxNum)
            maxNum = arr[index];

        index++;
    }

    //TODO: not hardcoded epsilon?
    if (maxNum-minNum < 0.0001) 
        return arr;

    return arr.map(x => (x-minNum)/(maxNum-minNum));
}

export {NormalizeRanges};