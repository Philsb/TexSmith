import { Interpolation, Clamp } from "./mathUtils";

const NormalizeToRanges = (arr: any[], min: number = 0, max: number = 1) => {
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

    return arr.map(x => Interpolation.Lerp(min,max, (x-minNum)/(maxNum-minNum)));
}

const TestFunc = (arr: any[]) => {

    return arr.map((element, index, array) => {
        //for (x)

    });

}; 

const EvaluateColorGradient = (value: number, gradients: {x: number, color: number[]}[], fade = Interpolation.SmoothStep) => {
    //If gradients are not sorted, sort them
    gradients.sort((a,b) => a.x - b.x);

    let returnedColor = gradients[0].color;

    for (let index = 0; index < gradients.length; index ++) {
        let point = gradients[index];
        
        if (value <= point.x) {
            let lastPoint = gradients[ Clamp (index - 1 , 0, gradients.length - 1)];

            let alpha = (value - lastPoint.x)/ (point.x - lastPoint.x);

            let r = fade(lastPoint.color[0] , point.color[0], alpha);
            let g = fade(lastPoint.color[1] , point.color[1], alpha);
            let b = fade(lastPoint.color[2] , point.color[2], alpha);

            returnedColor = [r,g,b];
            break;
        }
    }
 

    return returnedColor;
};

export {NormalizeToRanges, EvaluateColorGradient};