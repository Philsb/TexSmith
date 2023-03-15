import { Interpolation } from "./mathUtils";

//TODO: random library with hash algorithm

const perlin = (seed, resolution,frequency = 4, fade = Interpolation.SmoothStep) => {
    
    //TODO: fix this mess...
    let precomputedGradients = new Array(Math.ceil(frequency)**2);

    let i = 0, len = precomputedGradients.length;
    while (i < len) {
        let rand1 =  Math.random()*2*Math.PI;
        precomputedGradients[i] = [Math.cos(rand1),Math.sin(rand1)] ;
        i++;
    }

    console.log(precomputedGradients);

    const dot = (vec1, vec2) => {
        return (vec2[0]*vec1[0] + vec2[1]*vec1[1]);
    };
    
    const perlinNoise3d = (x  = 0, y  = 0, z = 0) => {

        let freq = Number(frequency);
        let quadrantX = Math.floor(Number((x*frequency))/Number(resolution));
        let quadrantY = Math.floor(Number((y*frequency))/Number(resolution));


        let q00 = precomputedGradients[(quadrantX+(quadrantY*freq))];
        let q10 = precomputedGradients[((   (quadrantX+1)%freq    )+(quadrantY*freq))];
        let q01 = precomputedGradients[(quadrantX+((  (quadrantY+1)%freq  )*freq))];
        let q11 = precomputedGradients[((    (quadrantX+1)%freq    )+((   (quadrantY+1)%freq     )*freq))];

        // Determine interpolation weights
        // Could also use higher order polynomial/s-curve here
        let sx = Number((x*frequency))/Number(resolution) - quadrantX;
        let sy = Number((y*frequency))/Number(resolution) - quadrantY;

        let n0 = dot(q00, [sx, sy]);
        let n1 = dot(q10, [sx-1, sy]);
        let ix0 = fade(n0, n1, sx);

        n0 = dot(q01, [sx, sy-1]);
        n1 = dot(q11, [sx-1, sy-1]);
        let ix1 = fade(n0, n1, sx);

        let value = fade(ix0, ix1, sy) ;
        //Returns [-1,1] so multiply and add by 0.5 -> [0,1]
        return (value*0.5)+0.5;
    };
    
    let valueArr = [];

    for (let i = 0; i<(resolution*resolution); i++) {
        let x = i % Number(resolution);
        let y = Math.floor(i/Number(resolution));

        let value = perlinNoise3d(x, y);
        valueArr.push(value);
    }
   
    return valueArr;
};

export default perlin;