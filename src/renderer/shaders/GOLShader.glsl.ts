import { GenerateFunction, ShaderSource } from "../shader";
import DefaultVertexShader, { DefaultRenderToScreenShader } from "./defaultShaders.glsl";
import { GlslInterpolation } from "./math.glsl";
import NoiseRng from "./noiseRNG.glsl";

const GameOfLifeShaderSource: ShaderSource = <ShaderSource>{
    functions: {
        NoiseRng: NoiseRng,
        fade: GenerateFunction(GlslInterpolation.SmoothStep, "fade")
    },
    vertex: DefaultVertexShader,
    fragment:
    `#version 300 es
    precision mediump float;
    in vec2 coord;
    out vec4 fragColor;

    #NoiseRng
    #fade
    uniform sampler2D prevFrame;
    uniform int resolution;
    uniform int iteration;

    uniform float x1_val;
    uniform float x2_val;
    uniform float x3_val;
    uniform float y1_val;
    uniform float y2_val;
    uniform float y3_val;

    float gauss(float x, float mean, float sx){
    
        float arg = x-mean;
        arg = (-1./2.)*( (arg*arg) / sx);
        
        float a = 1./(pow(2.*3.1415*sx, 0.5));
        
        return a*exp(arg);
    }

    float mount (float x, float mean, float plateau, float smoothness) {
        float val = 0.0f;
        if (x < mean-(plateau/2.)-smoothness ) {
            val = 0.;
        }
        else if (x < mean-(plateau/2.)) {
            val = fade(0.,1., (x - mean-(plateau/2.)-smoothness)  / smoothness  );
        }
        else if (x < mean+(plateau/2.)) {
            val = 1.0f;
        }
        else if (x < mean+(plateau/2.)+smoothness) {
            val = fade(1.,0.,  (x - mean+(plateau/2.) )/ smoothness );
        }
        else {
            val = 0.0f;
        }

        return val;
    }

    void main(void) {
        vec2 coord = vec2(gl_FragCoord)/float(resolution);
        if (iteration == 0) {
            uint n = Noise2D(uint(coord.x * float(resolution)), uint(coord.y * float(resolution)) ,0u);
            float color = float(n) / float(0x0fffffffu);
            fragColor = vec4(color, color, color, 1.0f);
        }
        else {

            float col = texture(prevFrame, coord).x;
            float col_up = texture(prevFrame, coord+(vec2(0.0f,1.0f)/float(resolution))).x;
            float col_down = texture(prevFrame, coord+(vec2(0.0f,-1.0f)/float(resolution))).x;
            float col_left = texture(prevFrame, coord+(vec2(1.0f,0.0f)/float(resolution))).x;
            float col_right = texture(prevFrame, coord+(vec2(-1.0f,0.0f)/float(resolution))).x;
            float col_up_left = texture(prevFrame, coord+(vec2(1.0f,1.0f)/float(resolution))).x;
            float col_up_right = texture(prevFrame, coord+(vec2(-1.0f,1.0f)/float(resolution))).x;
            float col_down_left = texture(prevFrame, coord+(vec2(1.0f,-1.0f)/float(resolution))).x;
            float col_down_right = texture(prevFrame, coord+(vec2(-1.0f,-1.0f)/float(resolution))).x;

            float val = (col_up + col_down + col_left + col_right) + 0.64*(col_up_left + col_up_right + col_down_left + col_down_right);
            float final_col = 0.0f;
            
            //float aliveVal = gauss(val*x_val, 2.5, 1.)*y_val;
            //float deathVal = gauss(val*z_val, 3., 1.)*w_val;

            float aliveVal = mount(val, x1_val, x2_val, x3_val);
            float deathVal = mount(val, y1_val, y2_val, y3_val) * 0.5;

            uint randFactor = Noise2D(uint(coord.x * float(resolution)), uint(coord.y * float(resolution)) ,uint(iteration));
            float randVal = float(randFactor) / float(0x0fffffffu);
            
            final_col = fade(deathVal, aliveVal, col);

            
            
            /*if (col > 0.0f) {
                if (val >= 2.f && val <= 3.0f) {
                    final_col = 1.0f;
                }
            }
            else {
                if (val == 3.0f) {
                    final_col = 1.0f;
                }
            }*/
            
            fragColor = vec4(final_col, final_col, final_col, 1.0f);
        }

    }
    `
    ,
};

export default GameOfLifeShaderSource;