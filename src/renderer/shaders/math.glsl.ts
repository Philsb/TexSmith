import { GlslFunction } from "../shader";

const GlslInterpolation = {
//SmoothStep Interpolation
SmoothStep: <GlslFunction> {
    definition:
`
float #{fun}(float a, float b, float alpha){
    return (b - a) * ((alpha * (alpha * 6.0 - 15.0) + 10.0) * alpha * alpha * alpha) + a;
}
`
}
, 
/*Lerp: (a = 0, b = 1, alpha =  0.5) => {
    return a + (b - a) * alpha;
},
Circle: (a = 0,b = 1, alpha = 0.5) => {
    return a + (1 - Math.sqrt(1 - alpha**2))*(b - a);
},
CircleInverted: (a,b,alpha) => {
    return a + (Math.sqrt(1 - (alpha-1)**2))*(b - a);
}*/

} as const;

const GlslVectors = {
    //SmoothStep Interpolation
    DistanceSquared3D: <GlslFunction> {
        definition:
`
float #{fun}(vec3 v1, vec3 v2){
    vec3 difVec = vec3(v1.x-v2.x, v1.y-v2.y, v1.z-v2.z);
    return difVec.x*difVec.x + difVec.y*difVec.y + difVec.z*difVec.z;
}
`
    }
    , 
    
} as const;

export {GlslInterpolation, GlslVectors};
