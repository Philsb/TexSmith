const NoiseRng: string = `
const uint BITNOISE1 = 0xB5297A4D;
const uint BITNOISE2 = 0x68E31DA4;
const uint BITNOISE3 = 0x1B56C4E9;
const uint PRIME1 = 198491317;
const uint PRIME2 = 6542989;

uint Noise32_Squirrel3(uint x, uint seed){
	uint n = x;
	n *= BITNOISE1;
	n += seed;
	n ^= (n >> 8);
	n += BITNOISE2;
	n ^= (n << 8);
	n *= BITNOISE3;
	n ^= (n >> 8);
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
` as const;

export default NoiseRng;