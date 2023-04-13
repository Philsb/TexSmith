import { Clamp, Dot2D, Interpolation, MagnitudeSquared3D } from "./mathUtils";
//import init, * as wasm from "../../build/assembly-libs";
//TODO: random library with hash algorithm
const Noise = {
    /*
    Credit to Squirrel Eiserloh with this video at GDC:
        https://www.youtube.com/watch?v=LWFzPP8ZbdU

    */

    MAX_NOISE_VAL:  2147483647,
    Noise32_Squirrel13: (x: number, seed:number) => {

        const BITNOISE1: number = 0xB5297A4D
        const BITNOISE2: number = 0x68E31DA4
        const BITNOISE3: number = 0x1B56C4E9
        
        let n: number = x;
        n *= BITNOISE1;
        n += seed;
        n ^= (n >> 8);
        n += BITNOISE2;
        n ^= (n << 8);
        n *= BITNOISE3;
        n ^= (n >> 8);
        return n;
    
    },

    //Change Names of the function
    Noise1D: function (x: number, seed: number) {
        return this.Noise32_Squirrel13(x, seed);
    },

    Noise2D: function (x: number, y: number, seed: number ) {
        const PRIME1: number = 198491317;
        
        return this.Noise32_Squirrel13(x + (PRIME1 * y), seed);
    },

    Noise3D: function (x: number, y: number, z: number, seed: number ) {
        const PRIME1: number = 198491317;
        const PRIME2: number = 6542989;
        return this.Noise32_Squirrel13(x + (PRIME1 * y) + (PRIME2 * z), seed);
    },

    PerlinNoise3d : function({seed = 0, freq = 4, x = 0, y = 0, z = 0, customGradients = null, fade = Interpolation.SmoothStep}) {
    
        let quadrantX = Math.floor(x*freq);
        let quadrantY = Math.floor(y*freq);
        let quadrantZ = Math.floor(z*freq);
        let q00,q10,q01,q11;

        //If it already has precomputed the gradients dont compute them again
        /*if (customGradients != null) {
            let gradientSize = customGradients.length - 1;
            q00 = customGradients[(quadrantX+(quadrantY*freq)) % gradientSize];
            q10 = customGradients[((   (quadrantX+1)%freq    )+(quadrantY*freq)) % gradientSize];
            q01 = customGradients[(quadrantX+((  (quadrantY+1)%freq  )*freq)) % gradientSize];
            q11 = customGradients[((    (quadrantX+1)%freq    )+((   (quadrantY+1)%freq     )*freq)) % gradientSize];
        }*/
        if (customGradients != null) {
            
            let rand1 = this.Noise2D(quadrantX, quadrantY*freq, seed);
            q00 = customGradients[rand1%customGradients.length]
            
            let rand2 = this.Noise2D((quadrantX+1)%freq, quadrantY*freq, seed);
            q10 = customGradients[rand2%customGradients.length]
            
            let rand3 = this.Noise2D(quadrantX, ((quadrantY+1)%freq)*freq, seed);
            q01 = customGradients[rand3%customGradients.length]
            
            let rand4 = this.Noise2D((quadrantX+1)%freq,((quadrantY+1)%freq)*freq,seed);
            q11 = customGradients[rand4%customGradients.length]
        }
        else {
            let rand1 = (this.Noise2D(quadrantX, quadrantY*freq, seed)/ this.MAX_NOISE_VAL) * 2 * Math.PI;
            q00 = [Math.cos(rand1),Math.sin(rand1)]
            
            let rand2 = (this.Noise2D((quadrantX+1)%freq, quadrantY*freq, seed)/ this.MAX_NOISE_VAL) * 2 * Math.PI;
            q10 = [Math.cos(rand2),Math.sin(rand2)]
            
            let rand3 = (this.Noise2D(quadrantX, ((quadrantY+1)%freq)*freq, seed)/ this.MAX_NOISE_VAL) * 2 * Math.PI;
            q01 = [Math.cos(rand3),Math.sin(rand3)]
            
            let rand4 = (this.Noise2D((quadrantX+1)%freq,((quadrantY+1)%freq)*freq,seed)/ this.MAX_NOISE_VAL) * 2 * Math.PI;
            q11 = [Math.cos(rand4),Math.sin(rand4)]

        }

        // Determine interpolation weights
        // Could also use higher order polynomial/s-curve here
        let sx = (x*freq) - quadrantX;
        let sy = (y*freq) - quadrantY;

        let n0 = Dot2D(q00, [sx, sy]);
        let n1 = Dot2D(q10, [sx-1, sy]);
        let ix0 = fade(n0, n1, sx);

        n0 = Dot2D(q01, [sx, sy-1]);
        n1 = Dot2D(q11, [sx-1, sy-1]);
        let ix1 = fade(n0, n1, sx);

        let value = Interpolation.Lerp(ix0, ix1, sy) ;
        //Returns [-1,1] so multiply and add by 0.5 -> [0,1]
        return value;
    },
    
    /*
    Fast Worley Noise divides the coordinates with cells, each cell with 1 point.
    This is instead of the original worley that just spreads points randomly on the coordinates.
    */
    FastWorleyNoise3D: function ({seed = 0, freq = 4, x = 0, y = 0, z = 0, customCellLocations = null}) {
        let quadrantX = Math.floor(x*freq);
        let quadrantY = Math.floor(y*freq);
        let quadrantZ = Math.floor(z*freq);
        
        let value = 0.0;
        //If it already has precomputed the locations dont compute them again
        if (customCellLocations != null) {
            let leastDistance = Number.MAX_VALUE;
            for (let xIndex: number = -1; xIndex <=  1; xIndex++) {
                for (let yIndex: number = -1; yIndex <= 1; yIndex++) {
                    for (let zIndex: number = -1; zIndex <= 1; zIndex++) {   

                        let index: number = ((quadrantX+xIndex)%freq + ((quadrantY+yIndex)%freq * freq) + (zIndex+1 * freq**2));                       
                        let location = customCellLocations[index % (customCellLocations.length - 1)];

                        let sx = (x*freq) - quadrantX;
                        let sy = (y*freq) - quadrantY;
                        let sz = (z*freq) - quadrantZ;

                        let magnitudeSquared = MagnitudeSquared3D([sx - (location[0] + xIndex), sy - (location[1] + yIndex), sz - (location[2] + zIndex) ])

                        if (magnitudeSquared < leastDistance) {
                            leastDistance = magnitudeSquared;
                        }
                    }
                }
            }

            value = Math.sqrt(leastDistance);
        }
        else {
            
        }

        return value;
    },

    PerlinTexture2D: function (
        {   
            seed = 0, 
            posZ = 0, 
            resolution = 256, 
            octaves = 4, 
            startingOctave = 4,
            lacunarity = 2,
            persistance = 2,
            fade = Interpolation.SmoothStep,
            octaveMix = (value, octaveIteration, x, y) => {
                return value / persistance**(octaveIteration);
            }
        } : {seed: number, posZ: number, resolution: number, octaves: number, startingOctave: number, lacunarity: number, persistance: number, fade, octaveMix}
        )
    {
        //TODO: fix this mess...

        let amountOfCells = Math.min(lacunarity ** (octaves+startingOctave), resolution); 
        //let precomputedGradients = new Array(Math.ceil(amountOfCells)**2);
    
        //let i: number = 0, len = precomputedGradients.length;
        /*while (i < len) {
            let rand1 =  (this.Noise1D(i,seed)/this.MAX_NOISE_VAL) * 2 * Math.PI;
            precomputedGradients[i] = [Math.cos(rand1),Math.sin(rand1)];
            i++;
        }*/
        let arraySize = 512*512;
        let precomputedGradients = new Array(arraySize);
        
        let i: number = 0, len = precomputedGradients.length;
        while (i < len) {
            let n =  i/arraySize * 2 * Math.PI;
            precomputedGradients[i] = [Math.cos(n),Math.sin(n)];
            i++;
        }
    
        
        
        let valueArr: number[] = new Array(resolution*resolution);
        
        for (let octIter = startingOctave; octIter < octaves+startingOctave; octIter++) {
            
            for (let i = 0; i<(resolution*resolution); i++) {
                let x = i % resolution;
                let y = Math.floor(i/resolution);
        
                let value = this.PerlinNoise3d({seed: seed, freq: lacunarity**(octIter-1), x: x/resolution, y: y/resolution, customGradients: precomputedGradients, fade: fade});

                if (octIter == startingOctave) {
                    valueArr[i] = 0;
                } 

                valueArr[i] += octaveMix(value, octIter - startingOctave, x, y); 

            }

        }
        
       
        return valueArr;
    },

    WorleyTexture2D: function (
        {   
            seed = 0, 
            posZ = 0, 
            resolution = 256, 
            octaves = 4, 
            startingOctave = 4,
            lacunarity = 2,
            persistance = 2,
            fade = Interpolation.SmoothStep,
            octaveMix = (value, octaveIteration, x, y) => {
                return value / persistance**(octaveIteration);
            }
        } : {seed: number, posZ: number, resolution: number, octaves: number, startingOctave: number, lacunarity: number, persistance: number, fade, octaveMix}
    ) {
        let amountOfCells = Math.min(lacunarity ** (octaves+startingOctave), resolution); 
        let precomputedCells = new Array(Math.ceil(amountOfCells)**2 * 3);
    
        let i: number = 0, len = precomputedCells.length;
        while (i < len) {

            let x = i % resolution;
            let y = Math.floor((i%(resolution**2))/(resolution));
            let z = Math.floor(i/(resolution**2));

            //bad random sample
            let rand1 =  this.Noise3D(x,y,z,seed)/this.MAX_NOISE_VAL;
            let rand2 =  this.Noise3D(y,z,x,seed)/this.MAX_NOISE_VAL;
            let rand3 =  this.Noise3D(z,x,y,seed)/this.MAX_NOISE_VAL;

            precomputedCells[i] = [rand1,rand2,rand3];
            i++;
        }
    
        let valueArr: number[] = new Array(resolution*resolution);
        

        for (let octIter = startingOctave; octIter < octaves+startingOctave; octIter++) {
            
            for (let i = 0; i<(resolution*resolution); i++) {
                let x = i % Number(resolution);
                let y = Math.floor(i/resolution);
        
                let value = this.FastWorleyNoise3D({seed: seed, freq: lacunarity**(octIter-1), x: x/resolution, y: y/resolution, z: posZ/resolution, customCellLocations: precomputedCells, fade: fade});

                if (octIter == startingOctave) {
                    valueArr[i] = 0;
                } 
                valueArr[i] += octaveMix(fade(0,1,value), octIter - startingOctave, x, y); 

            }

        }
        
       
        return valueArr;

    }

} as const;

/*const loadNoise = new Promise((resolve) => {
    init().then(() => {
            resolve(Noise);
        }
    );
});*/

export default Noise;