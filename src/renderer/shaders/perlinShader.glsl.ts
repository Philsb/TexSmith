import { GenerateFunction, GlslFunction, ShaderSource } from "../shader";
import DefaultVertexShader from "./defaultShaders.glsl";
import { GlslInterpolation } from "./math.glsl";
import NoiseRng from "./noiseRNG.glsl";

const PerlinShaderSource: ShaderSource = <ShaderSource>{
    functions: {
        NoiseRng: NoiseRng,
        octaveMix: GenerateFunction(<GlslFunction> {
            definition: 
`
float #{fun}(float previousValue, float value, float octaveIteration, float x, float y) {
return  previousValue + ((value - 0.5f) / pow(persistance,octaveIteration));
}
`
        },"octaveMix")
        ,
        fade: GenerateFunction(GlslInterpolation.SmoothStep, "fade"),
    },
        vertex: DefaultVertexShader,
//TODO: optimize shaders, has a lot of unnecesary casting
        fragment: 
`#version 300 es
precision highp float;
precision highp int;

out vec4 fragColor;
in vec2 coord;

uniform int seed;
uniform int octaves;
uniform int startingOctave;
uniform float lacunarity;
uniform int resolution;
uniform float persistance;
uniform float posZ;

uniform sampler2D sampleCoords;

#define PI 3.1415926538

#NoiseRng
#octaveMix
#fade

float samplePerlin3D(int seed, float x, float y, float z, int freq) {
    //Quadrant X, Y, Z
    int qX = int( floor(x*float(freq)) );
    int qY = int( floor(y*float(freq)) );
    int qZ = int( floor(z*float(freq)) );

    vec3 q000,q100,q010,q110,q001,q101,q011,q111;


    uint uQX = uint(qX);
    uint uQY = uint(qY);
    uint uQZ = uint(qZ);
    uint uQX1 = uint(mod(float(qX+1) , float(freq) ));
    uint uQY1 = uint(mod(float(qY+1) , float(freq) ));
    uint uQZ1 = uint(mod(float(qZ+1) , float(freq) ));

    q000 = generateRandomGradient3D(uQX, uQY, uQZ, uint(seed));
    q100 = generateRandomGradient3D(uQX1, uQY, uQZ, uint(seed));
    q010 = generateRandomGradient3D(uQX, uQY1, uQZ, uint(seed));
    q110 = generateRandomGradient3D(uQX1, uQY1, uQZ, uint(seed));

    q001 = generateRandomGradient3D(uQX, uQY, uQZ1, uint(seed));
    q101 = generateRandomGradient3D(uQX1, uQY, uQZ1, uint(seed));
    q011 = generateRandomGradient3D(uQX, uQY1, uQZ1, uint(seed));
    q111 = generateRandomGradient3D(uQX1, uQY1, uQZ1, uint(seed));

    // Determine interpolation weights
    // Could also use higher order polynomial/s-curve here
    float sx = (x*float(freq)) - float(qX);
    float sy = (y*float(freq)) - float(qY);
    float sz = (z*float(freq)) - float(qZ);

    float fx = fade(0.0f,1.0f,sx);
    float fy = fade(0.0f,1.0f,sy);
    float fz = fade(0.0f,1.0f,sz);

    float d0, d1;

    d0 = dot(q000, vec3(sx, sy, sz));
    d1 = dot(q100, vec3(sx-1.0f, sy, sz));
    float ix0 = mix(d0, d1, fx);

    d0 = dot(q010, vec3(sx, sy-1.0f, sz));
    d1 = dot(q110, vec3(sx-1.0f, sy-1.0f, sz));
    float ix1 = mix(d0, d1, fx);

    float valueX = mix(ix0, ix1, fy);

    d0 = dot(q001, vec3(sx, sy, sz-1.0f));
    d1 = dot(q101, vec3(sx-1.0f, sy, sz-1.0f));
    float ix2 = mix(d0, d1, fx);

    d0 = dot(q011, vec3(sx, sy-1.0f, sz-1.0f));
    d1 = dot(q111, vec3(sx-1.0f, sy-1.0f, sz-1.0f));
    float ix3 = mix(d0, d1, fx);
    float valueZ = mix(ix2, ix3, fy);

    float value = mix(valueX, valueZ, fz);
    return (value*0.5) + 0.5;
}

void main() {
    //vec3 sampleCoords = texture(sampleCoords, (coord*0.5) + vec2(0.5f,0.5f) ).xyz;

    vec4 finalVec = vec4(0.f,0.f,0.f,0.f);

    float prevValue = 0.0f;
    float x = coord.x*0.5 + 0.5f;
    float y = coord.y*0.5 + 0.5f;

    for (int octIter = startingOctave; octIter < octaves+startingOctave; octIter++) {
        int frequency = int( floor(pow(lacunarity , float(octIter-1)) ));
        float value = samplePerlin3D(seed, x, y, posZ, frequency);
        if (octIter == startingOctave) {
            prevValue = value;
        }
        else {
            prevValue = octaveMix(prevValue, value, float(octIter - startingOctave), x, y);
        }
    }

    //float f2 = abs((finalValue - 0.5f) * 2.f);
    finalVec.x = prevValue;
    fragColor = finalVec;
}
`
};

export default PerlinShaderSource;