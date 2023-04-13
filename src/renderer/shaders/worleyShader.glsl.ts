import { GenerateFunction, GlslFunction, ShaderSource } from "../shader";
import DefaultVertexShader from "./defaultShaders.glsl";
import { GlslInterpolation, GlslVectors } from "./math.glsl";
import NoiseRng from "./noiseRNG.glsl";

const WorleyShaderSource: ShaderSource = <ShaderSource>{
    functions: {
        NoiseRng: NoiseRng,
        distanceSquared3D: GenerateFunction(GlslVectors.DistanceSquared3D, "distanceSquared3D"),
        octaveMix: GenerateFunction(<GlslFunction> {
            definition: 
`
float #{fun}(float previousValue, float value, float octaveIteration, float x, float y) {
return  previousValue + ((value - 0.5f)/ pow(u_persistance,octaveIteration));
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

uniform int u_seed;
uniform int u_octaves;
uniform int u_startingOctave;
uniform float u_lacunarity;
uniform int u_resolution;
uniform float u_persistance;
uniform float u_posZ;

uniform sampler2D sampleCoords;

#define PI 3.1415926538

#NoiseRng
#distanceSquared3D
#octaveMix
#fade

float sampleFastWorley3D(int seed, float x, float y, float z, int freq) {
    //Quadrant X, Y, Z
    int qX = int( floor(x*float(freq)) );
    int qY = int( floor(y*float(freq)) );
    int qZ = int( floor(z*float(freq)) );

    float leastDistance = 10000000000.f;
    for (int xIndex = -1; xIndex <=  1; xIndex++) {
        for (int yIndex = -1; yIndex <= 1; yIndex++) {
            for (int zIndex = -1; zIndex <= 1; zIndex++) {   

                float fltFreq = float(freq);

                int pX = int( mod(float(qX+xIndex) , fltFreq) );
                int pY = int( mod(float(qY+yIndex) , fltFreq) );
                int pZ = int( mod(float(qZ+zIndex) , fltFreq) );

                vec3 location = generateRandomPosition3D(uint(pX), uint(pY), uint(pZ), uint(seed));

                float sx = (x*float(freq)) - float(qX);
                float sy = (y*float(freq)) - float(qY);
                float sz = (z*float(freq)) - float(qZ);

                vec3 currentPos = vec3(sx, sy, sz);
                vec3 destPos = vec3 (location.x + float(xIndex), location.y + float(yIndex), location.z + float(zIndex));
                float magnitudeSquared = distanceSquared3D(currentPos, destPos);

                if (magnitudeSquared <= leastDistance) {
                    leastDistance = magnitudeSquared;
                }
            }
        }
    }


    //float value = sqrt(leastDistance); 
    return sqrt(leastDistance);

}

void main() {
    //vec3 sampleCoords = texture(sampleCoords, (coord*0.5) + vec2(0.5f,0.5f) ).xyz;

    vec4 finalVec = vec4(0.f,0.f,0.f,1.f);

    float prevValue = 0.0f;
    float x = coord.x*0.5 + 0.5f;
    float y = coord.y*0.5 + 0.5f;

    for (int octIter = u_startingOctave; octIter < u_octaves + u_startingOctave; octIter++) {
        int frequency = int( floor(pow(u_lacunarity , float(octIter-1)) ));
        float value = sampleFastWorley3D(u_seed, x, y, u_posZ, frequency);
        if (octIter == u_startingOctave) {
            prevValue = value*0.6f;
        }
        else {
            prevValue = octaveMix(prevValue, value, float(octIter - u_startingOctave), x, y);
        }
    }

    //float f2 = abs((finalValue - 0.5f) * 2.f);
    finalVec.x = prevValue;

    fragColor = finalVec;
}
`

};

export default WorleyShaderSource;