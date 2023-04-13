const NoiseRng: string = `
const uint BITNOISE1 = uint(0xB5297A4D);
const uint BITNOISE2 = uint(0x68E31DA4);
const uint BITNOISE3 = uint(0x1B56C4E9);
//const uint PRIME1 = uint(198491317);
const uint PRIME1 = uint(27277);
const uint PRIME2 = uint(15173);
//const uint PRIME2 = uint(6542989);

uint Noise32_Squirrel3(uint x, uint seed){
	uint n = x; 
	n *= BITNOISE1;
	n += seed;
	n ^= (n >> 8u);
	n += BITNOISE2;
	n ^= (n << 8u);
	n = n * BITNOISE3;
	n ^= (n >> 8u);
	n &= 0x0fffffffu;
	return n;
}

uint Noise1D(uint x, uint seed) {
	return Noise32_Squirrel3(x, seed);
}

uint Noise2D(uint x, uint y, uint seed) {
	return Noise32_Squirrel3(x + (PRIME1 * y), seed);
}

uint Noise3D(uint x, uint y, uint z, uint seed) {
	return Noise32_Squirrel3(x + (PRIME1 * y) + (PRIME2 * z), seed);
}

//Credits to for spherical random sample
//http://corysimon.github.io/articles/uniformdistn-on-sphere/
vec3 generateRandomGradient3D(uint x, uint y, uint z, uint seed) {
	uint n = Noise3D(x,y,z,seed);
	float theta = ( float (n & 0x00003fffu) / float(0x00003fffu) ) * 2.0f *PI;
	float phi = acos(1.f - 2.0f*(   float((n & 0x0fffc000u) >> 14)/ float(0x00003fffu)));
	
	//float r = float(n) / float(0x0fffffffu);
	//return vec3( cos(r), sin(r), 0.0f );
	
	return vec3( sin(phi)*cos(theta), sin(phi)*sin(theta), cos(phi) );
}

vec3 generateRandomPosition3D(uint x, uint y, uint z, uint seed) {
	uint n = Noise3D(x,y,z,seed);
	
	float vX = float(n & 0x000001ffu) / float(0x000001ffu);
	float vY = float((n & 0x0003fe00u) >> 9) / float(0x000001ffu);
	float vZ = float((n & 0x07fc0000u) >> 18) / float(0x000001ffu);
	
	return vec3(vX, vY, vZ);
}

` as const;

export default NoiseRng;