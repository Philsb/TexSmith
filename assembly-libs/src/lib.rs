

use wasm_bindgen::prelude::*;

static PRIME1:u32 = 198491317;
static PRIME2:u32 = 6542989;

#[wasm_bindgen]
pub fn max_noise_val() -> u32 {
    return 2147483647;
}

#[wasm_bindgen]
#[inline(always)]
pub fn noise32_squirrel13 (x:u32, seed:u32) -> u32{

    let bitnoise1:u32 = 0xB5297A4D;
    let bitnoise2:u32 = 0x68E31DA4;
    let bitnoise3:u32 = 0x1B56C4E9;
    
    let mut n:u32 = x;
    n = n.wrapping_mul(bitnoise1);
    n = n.wrapping_add(seed);
    n ^= n >> 8;
    n = n.wrapping_add(bitnoise2);
    n ^= n << 8;
    n = n.wrapping_mul(bitnoise3);
    n ^= n >> 8;
    return n;

}  

//Change Names of the function
#[wasm_bindgen]
pub fn noise1D (x:u32, seed:u32) -> u32{
    return noise32_squirrel13(x, seed);
}
#[wasm_bindgen]
pub fn noise2D (x:u32, y:u32, seed:u32 ) -> u32{
    return noise32_squirrel13(x.wrapping_add(y.wrapping_mul(PRIME1)), seed);
}
#[wasm_bindgen]
pub fn noise3D (x:u32, y:u32, z:u32, seed:u32 ) -> u32{
    return noise32_squirrel13(x.wrapping_add(y.wrapping_mul(PRIME1).wrapping_add(z.wrapping_mul(PRIME2))), seed);
}
