import { Interpolation } from "./mathUtils";

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

    perlinNoise3d : function({seed = 0, freq = 4, x = 0, y  =  0, z = 0, customGradients = null, fade = Interpolation.SmoothStep}) {
    
        const dot2D = (vec1, vec2) => {
            return (vec2[0]*vec1[0] + vec2[1]*vec1[1]);
        };

        let quadrantX = Math.floor(x*freq);
        let quadrantY = Math.floor(y*freq);
        let q00,q10,q01,q11;
        //If it already has precomputed the gradients dont compute them again
        if (customGradients != null) {
            let gradientSize = customGradients.length - 1;
            q00 = customGradients[(quadrantX+(quadrantY*freq)) % gradientSize];
            q10 = customGradients[((   (quadrantX+1)%freq    )+(quadrantY*freq)) % gradientSize];
            q01 = customGradients[(quadrantX+((  (quadrantY+1)%freq  )*freq)) % gradientSize];
            q11 = customGradients[((    (quadrantX+1)%freq    )+((   (quadrantY+1)%freq     )*freq)) % gradientSize];
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

        let n0 = dot2D(q00, [sx, sy]);
        let n1 = dot2D(q10, [sx-1, sy]);
        let ix0 = fade(n0, n1, sx);

        n0 = dot2D(q01, [sx, sy-1]);
        n1 = dot2D(q11, [sx-1, sy-1]);
        let ix1 = fade(n0, n1, sx);

        let value = fade(ix0, ix1, sy) ;
        //Returns [-1,1] so multiply and add by 0.5 -> [0,1]
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
            peristance = 0.5,
            fade = Interpolation.SmoothStep,
            octaveMix = (value, octaveIteration, x, y) => {
                return value / 2**(octaveIteration);
            }
        } : {seed: number, posZ: number, resolution: number, octaves: number, startingOctave: number, lacunarity: number, peristance: number, fade, octaveMix}
        )
    {
        //TODO: fix this mess...

        let amountOfCells = Math.min(lacunarity ** (octaves+startingOctave), resolution); 
        let precomputedGradients = new Array(Math.ceil(amountOfCells)**2);
    
        let i: number = 0, len = precomputedGradients.length;
        while (i < len) {
            let rand1 =  (this.Noise1D(i,seed)/this.MAX_NOISE_VAL) * 2 * Math.PI;
            precomputedGradients[i] = [Math.cos(rand1),Math.sin(rand1)];
            i++;
        }
    
        
        
        let valueArr: number[] = new Array(resolution*resolution);
        
        for (let octIter = startingOctave-1; octIter < octaves+startingOctave; octIter++) {
            
            for (let i = 0; i<(resolution*resolution); i++) {
                let x = i % Number(resolution);
                let y = Math.floor(i/resolution);
        
                let value = this.perlinNoise3d({seed: seed, freq: lacunarity**octIter, x: x/resolution, y: y/resolution, customGradients: precomputedGradients, fade: fade});

                if (octIter == startingOctave) {
                    valueArr[i] = 0;
                } 

                valueArr[i] += octaveMix(value, octIter, x, y); 

            }

        }
        
       
        return valueArr;
    }

} as const;


export {Noise};