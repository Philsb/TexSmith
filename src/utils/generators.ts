import { GenerateFunction, GenerateShader, GlslFunction, ShaderSource } from "../renderer/shader";
import GameOfLifeShaderSource from "../renderer/shaders/GOLShader.glsl";
import DefaultVertexShader, { DefaultRenderToScreenShader } from "../renderer/shaders/defaultShaders.glsl";
import PerlinShaderSource from "../renderer/shaders/perlinShader.glsl";
import WorleyShaderSource from "../renderer/shaders/worleyShader.glsl";
import { IsPowerOf2 } from "./mathUtils";

abstract class GpuImageGenerator {
    renderer: any;
    glcontext; 
	shader: ShaderSource;
	program;
	size: number;
	uniformsMap: Map<string, any>;

    constructor(size: number, shader: ShaderSource, renderTarget = null) {
		if (renderTarget != null) {
			this.renderer = renderTarget;
		}
		else {
			this.renderer = new OffscreenCanvas(size,size);
		}
        this.glcontext = this.renderer.getContext("webgl2", {preserveDrawingBuffer: true});
		this.glcontext.getExtension("OES_texture_float");
		this.glcontext.getExtension("OES_texture_float_linear");

		this.size = size;
		this.uniformsMap = new Map<string, any>();

		this.shader = shader;
		//Set shader
		this.program = this.createShaderProgram(this.shader);
        this.glcontext.useProgram(this.program);
		
		let QuadVertices = 
		[ // X, Y, 
			1.0, 1.0,   
			-1.0, -1.0,  
			-1.0, 1.0,
			1.0, 1.0,  
			1.0, -1.0,
			-1.0, -1.0,  
		];

		let QuadVBO = this.glcontext.createBuffer();
		this.glcontext.bindBuffer(this.glcontext.ARRAY_BUFFER, QuadVBO);
		this.glcontext.bufferData(this.glcontext.ARRAY_BUFFER, new Float32Array(QuadVertices), this.glcontext.STATIC_DRAW);

		let positionAttribLocation = this.glcontext.getAttribLocation(this.program, 'vertPosition');

		this.glcontext.vertexAttribPointer(
			positionAttribLocation, // Attribute location
			2, // Number of elements per attribute
			this.glcontext.FLOAT, // Type of elements
			this.glcontext.FALSE,
			2 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
			0 // Offset from the beginning of a single vertex to this attribute
		);
		this.glcontext.enableVertexAttribArray(positionAttribLocation);

    }

	abstract initUniforms(): void;
	abstract updateUniforms(params): void;
	
	generateImage(params) {
		
		//this.resize(size);
		this.updateUniforms(params);

		this.glcontext.clearColor(0.0, 0.0, 0.0, 0.0);    
		this.glcontext.clear(this.glcontext.DEPTH_BUFFER_BIT | this.glcontext.COLOR_BUFFER_BIT);
		this.glcontext.drawArrays(this.glcontext.TRIANGLES, 0, 6);

		let rawPixels = new Uint8Array(this.size*this.size*4);
		this.glcontext.readPixels(0, 0, this.size, this.size, this.glcontext.RGBA, this.glcontext.UNSIGNED_BYTE, rawPixels);
		
		let returnedPixels = new Float32Array(this.size*this.size);
		for(let i = 0; i < rawPixels.length; i += 4) {
			returnedPixels[i/4] = rawPixels[i]/255;
		}
		return returnedPixels;
	}
    
    createShaderProgram(inputShader: ShaderSource): WebGLProgram {
		// Create shaders
		let shaderText = GenerateShader(inputShader)
		//console.log(shaderText.fragment);

		let vertexShader = this.glcontext.createShader(this.glcontext.VERTEX_SHADER);
		let fragmentShader = this.glcontext.createShader(this.glcontext.FRAGMENT_SHADER);

		this.glcontext.shaderSource(vertexShader, shaderText.vertex);
		this.glcontext.shaderSource(fragmentShader, shaderText.fragment);

		this.glcontext.compileShader(vertexShader);
		if (!this.glcontext.getShaderParameter(vertexShader, this.glcontext.COMPILE_STATUS)) {
			console.error('ERROR compiling vertex shader!', this.glcontext.getShaderInfoLog(vertexShader));
			return;
		}

		this.glcontext.compileShader(fragmentShader);
		if (!this.glcontext.getShaderParameter(fragmentShader, this.glcontext.COMPILE_STATUS)) {
			console.error('ERROR compiling fragment shader!', this.glcontext.getShaderInfoLog(fragmentShader));
			return;
		}

		let program: WebGLProgram = this.glcontext.createProgram();
		this.glcontext.attachShader(program, vertexShader);
		this.glcontext.attachShader(program, fragmentShader);
		this.glcontext.linkProgram(program);
		if (!this.glcontext.getProgramParameter(program, this.glcontext.LINK_STATUS)) {
			console.error('ERROR linking program!', this.glcontext.getProgramInfoLog(program));
			return;
		}
		this.glcontext.validateProgram(program);
		if (!this.glcontext.getProgramParameter(program, this.glcontext.VALIDATE_STATUS)) {
			console.error('ERROR validating program!', this.glcontext.getProgramInfoLog(program));
			return;
		}

		return program;
	}
	//TODO: doesnt work with offscreencanvas
    resize(size: number) {
		this.renderer.width = size;
		this.renderer.height = size;
	}

}

class IterativeImageGeneration extends GpuImageGenerator {
	displayToTargetProgram;

	constructor(size: number, renderTarget = null) {
		
		const renderToTargetShader = <ShaderSource> {
			functions: [],
			vertex: DefaultVertexShader,
			fragment:`#version 300 es
			precision mediump float;
			in vec2 coord;
			out vec4 fragColor;
			
			uniform sampler2D screen;
			uniform int resolution;
			
			void main(void) {
				vec2 texCoord = vec2(gl_FragCoord)/float(resolution);
				
				vec4 col = texture(screen, texCoord);
				vec4 col_up = texture(screen, texCoord+(vec2(0.0f,1.0f) / float(resolution)));
				vec4 col_down = texture(screen, texCoord+(vec2(0.0f,-1.0f) / float(resolution)));
				vec4 col_left = texture(screen, texCoord+(vec2(1.0f,0.0f) / float(resolution)));
				vec4 col_right = texture(screen, texCoord+(vec2(-1.0f,0.0f) / float(resolution)));
			
				vec4 val = col_up + col_down + col_left + col_right;
				vec4 final_col = col * 1.0f + val*(0.0f*0.25);
				fragColor = vec4(final_col.xyz, 1.0f);
			}
			`
		};
		super(size, GameOfLifeShaderSource, renderTarget);
		
		//Set shader
		this.displayToTargetProgram = this.createShaderProgram(renderToTargetShader);
	
		//Set uniforms
		this.initUniforms();
	}

	generateImage(params) {
		
		//this.resize(size);
		this.updateUniforms(params);

		let tex0 = this.glcontext.createTexture();
		this.glcontext.activeTexture(this.glcontext.TEXTURE0);
		this.glcontext.bindTexture(this.glcontext.TEXTURE_2D, tex0);
		this.glcontext.texImage2D(this.glcontext.TEXTURE_2D, 0, this.glcontext.RGBA,
		this.size, this.size, 0, this.glcontext.RGBA, this.glcontext.UNSIGNED_BYTE, null);

		this.glcontext.texParameteri(this.glcontext.TEXTURE_2D, this.glcontext.TEXTURE_MAG_FILTER, this.glcontext.NEAREST);
		this.glcontext.texParameteri(this.glcontext.TEXTURE_2D, this.glcontext.TEXTURE_MIN_FILTER, this.glcontext.NEAREST);
		this.glcontext.texParameteri(this.glcontext.TEXTURE_2D, this.glcontext.TEXTURE_WRAP_S, this.glcontext.CLAMP_TO_EDGE);
		this.glcontext.texParameteri(this.glcontext.TEXTURE_2D, this.glcontext.TEXTURE_WRAP_T, this.glcontext.CLAMP_TO_EDGE);


		let tex1 = this.glcontext.createTexture();
		this.glcontext.activeTexture(this.glcontext.TEXTURE1);
		this.glcontext.bindTexture(this.glcontext.TEXTURE_2D, tex1);
		this.glcontext.texImage2D(this.glcontext.TEXTURE_2D, 0, this.glcontext.RGBA,
			this.size, this.size, 0, this.glcontext.RGBA, this.glcontext.UNSIGNED_BYTE, null);

		this.glcontext.texParameteri(this.glcontext.TEXTURE_2D, this.glcontext.TEXTURE_MAG_FILTER, this.glcontext.NEAREST);
		this.glcontext.texParameteri(this.glcontext.TEXTURE_2D, this.glcontext.TEXTURE_MIN_FILTER, this.glcontext.NEAREST);
		this.glcontext.texParameteri(this.glcontext.TEXTURE_2D, this.glcontext.TEXTURE_WRAP_S, this.glcontext.CLAMP_TO_EDGE);
		this.glcontext.texParameteri(this.glcontext.TEXTURE_2D, this.glcontext.TEXTURE_WRAP_T, this.glcontext.CLAMP_TO_EDGE);
		

		let FBOs = [this.glcontext.createFramebuffer(), this.glcontext.createFramebuffer()];
		this.glcontext.bindFramebuffer(this.glcontext.FRAMEBUFFER, FBOs[0]);	
		this.glcontext.framebufferTexture2D(this.glcontext.FRAMEBUFFER,
			this.glcontext.COLOR_ATTACHMENT0,
			this.glcontext.TEXTURE_2D,
			tex0,
			0);	

		this.glcontext.bindFramebuffer(this.glcontext.FRAMEBUFFER, FBOs[1]);	
		this.glcontext.framebufferTexture2D(this.glcontext.FRAMEBUFFER,
			this.glcontext.COLOR_ATTACHMENT0,
			this.glcontext.TEXTURE_2D,
			tex1,
			0);	
		 

		//this.glcontext.bindTexture(this.glcontext.TEXTURE_2D, null);
		this.glcontext.bindFramebuffer(this.glcontext.FRAMEBUFFER, null);

		let iteration = 0;
		let passIndex = 0;
		let self = this;	
		let button = <HTMLButtonElement>document.getElementById('button');
		button.addEventListener('click', (e) => {
			iteration = 0;
		})
		let loop = function () {

			//Update 
			let range1val = (<HTMLInputElement>document.getElementById('range1')).value;
			let range2val = (<HTMLInputElement>document.getElementById('range2')).value;
			let range3val = (<HTMLInputElement>document.getElementById('range3')).value;
			let range4val = (<HTMLInputElement>document.getElementById('range4')).value;
			let range5val = (<HTMLInputElement>document.getElementById('range5')).value;
			let range6val = (<HTMLInputElement>document.getElementById('range6')).value;


			//First pass
			self.glcontext.useProgram(self.program);
			self.glcontext.bindFramebuffer(self.glcontext.FRAMEBUFFER, FBOs[passIndex]);	
			
			self.glcontext.uniform1f(self.uniformsMap["x1_val"], range1val);
			self.glcontext.uniform1f(self.uniformsMap["x2_val"], range2val);
			self.glcontext.uniform1f(self.uniformsMap["x3_val"], range3val);
			self.glcontext.uniform1f(self.uniformsMap["y1_val"], range4val);
			self.glcontext.uniform1f(self.uniformsMap["y2_val"], range5val);
			self.glcontext.uniform1f(self.uniformsMap["y3_val"], range6val);

			self.glcontext.uniform1i(self.uniformsMap["mainTex"], 1-passIndex);
			self.glcontext.uniform1i(self.uniformsMap["resolution"], self.size);
			self.glcontext.uniform1i(self.uniformsMap["iteration"], iteration);

			self.glcontext.clearColor(0.0, 0.0, 0.0, 1.0); 
			self.glcontext.clear(self.glcontext.DEPTH_BUFFER_BIT | self.glcontext.COLOR_BUFFER_BIT);
			self.glcontext.drawArrays(self.glcontext.TRIANGLES, 0, 6);	

			//Second pass
			self.glcontext.bindFramebuffer(self.glcontext.FRAMEBUFFER, null);	
			
			self.glcontext.useProgram(self.displayToTargetProgram);
			self.glcontext.uniform1i(self.uniformsMap["screen"], passIndex);
			self.glcontext.uniform1i(self.uniformsMap["Shader2resolution"], self.size);

			self.glcontext.clear(self.glcontext.DEPTH_BUFFER_BIT | self.glcontext.COLOR_BUFFER_BIT);
			self.glcontext.drawArrays(self.glcontext.TRIANGLES, 0, 6);	
			
			iteration++;
			passIndex = (passIndex+1)%2;
			requestAnimationFrame(loop);
		}
		requestAnimationFrame(loop);

		return null;
	}

	initUniforms(){
		this.uniformsMap["mainTex"] = this.glcontext.getUniformLocation(this.program, "prevFrame");
		this.uniformsMap["resolution"] = this.glcontext.getUniformLocation(this.program, "resolution");
		this.uniformsMap["iteration"] = this.glcontext.getUniformLocation(this.program, "iteration");
		this.uniformsMap["x1_val"] = this.glcontext.getUniformLocation(this.program, "x1_val");
		this.uniformsMap["x2_val"] = this.glcontext.getUniformLocation(this.program, "x2_val");
		this.uniformsMap["x3_val"] = this.glcontext.getUniformLocation(this.program, "x3_val");
		this.uniformsMap["y1_val"] = this.glcontext.getUniformLocation(this.program, "y1_val");
		this.uniformsMap["y2_val"] = this.glcontext.getUniformLocation(this.program, "y2_val");
		this.uniformsMap["y3_val"] = this.glcontext.getUniformLocation(this.program, "y3_val");

		this.uniformsMap["screen"] = this.glcontext.getUniformLocation(this.displayToTargetProgram, "screen");
		this.uniformsMap["Shader2resolution"] = this.glcontext.getUniformLocation(this.displayToTargetProgram, "resolution");
	}
	updateUniforms(params){
		
	}
}

class PerlinGenerator extends GpuImageGenerator {
	constructor (size: number, renderTarget = null) {
		super(size, PerlinShaderSource, renderTarget);
		//Set uniforms
		this.initUniforms();
	}

	initUniforms() {
		this.uniformsMap["seed"]  = this.glcontext.getUniformLocation(this.program, "seed");
		this.uniformsMap["octaves"] = this.glcontext.getUniformLocation(this.program, "octaves");
		this.uniformsMap["startingOctave"] = this.glcontext.getUniformLocation(this.program, "startingOctave");
		this.uniformsMap["lacunarity"] = this.glcontext.getUniformLocation(this.program, "lacunarity");
		this.uniformsMap["resolution"] = this.glcontext.getUniformLocation(this.program, "resolution");
		this.uniformsMap["persistance"] = this.glcontext.getUniformLocation(this.program, "persistance");
		this.uniformsMap["sampleCoords"] = this.glcontext.getUniformLocation(this.program, "sampleCoords");
		this.uniformsMap["posZ"] = this.glcontext.getUniformLocation(this.program, "posZ");
	}

	updateUniforms(params): void {
		/*const level = 0;
		const internalFormat = this.glcontext.RGB;
		const border = 0;
		const srcFormat = this.glcontext.RGB;
		const srcType = this.glcontext.UNSIGNED_SHORT_5_6_5;

		this.glcontext.texImage2D(this.glcontext.TEXTURE_2D, level, internalFormat,
			size, size, border, srcFormat, srcType,
						params.coordinatesSample);

		// I dont think this is necesary
		if (IsPowerOf2(size) && IsPowerOf2(size)) {
			// Yes, it's a power of 2. Generate mips.
			this.glcontext.generateMipmap(this.glcontext.TEXTURE_2D);
		} else {
			// No, it's not a power of 2. Turn off mips and set
			// wrapping to clamp to edge
			this.glcontext.texParameteri(this.glcontext.TEXTURE_2D, this.glcontext.TEXTURE_WRAP_S, this.glcontext.CLAMP_TO_EDGE);
			this.glcontext.texParameteri(this.glcontext.TEXTURE_2D, this.glcontext.TEXTURE_WRAP_T, this.glcontext.CLAMP_TO_EDGE);
			this.glcontext.texParameteri(this.glcontext.TEXTURE_2D, this.glcontext.TEXTURE_MIN_FILTER, this.glcontext.LINEAR);
		}*/

		
		
		this.glcontext.uniform1i(this.uniformsMap["seed"], params.seed);
		this.glcontext.uniform1i(this.uniformsMap["octaves"], params.octaves);
		this.glcontext.uniform1i(this.uniformsMap["startingOctave"], params.startingOctave);
		this.glcontext.uniform1i(this.uniformsMap["resolution"], this.size);
		this.glcontext.uniform1f(this.uniformsMap["persistance"], params.persistance);
		this.glcontext.uniform1f(this.uniformsMap["posZ"], params.posZ);
		this.glcontext.uniform1f(this.uniformsMap["lacunarity"], params.lacunarity);

		this.glcontext.uniform1i(this.uniformsMap["sampleCoords"], 0);
	}

}

class WorleyGenerator extends GpuImageGenerator {
	constructor (size: number, renderTarget = null) {
		super(size, WorleyShaderSource, renderTarget);
		//Set uniforms
		this.initUniforms();
	}

	initUniforms() {
		this.uniformsMap["seed"]  = this.glcontext.getUniformLocation(this.program, "u_seed");
		this.uniformsMap["octaves"] = this.glcontext.getUniformLocation(this.program, "u_octaves");
		this.uniformsMap["startingOctave"] = this.glcontext.getUniformLocation(this.program, "u_startingOctave");
		this.uniformsMap["lacunarity"] = this.glcontext.getUniformLocation(this.program, "u_lacunarity");
		this.uniformsMap["resolution"] = this.glcontext.getUniformLocation(this.program, "u_resolution");
		this.uniformsMap["persistance"] = this.glcontext.getUniformLocation(this.program, "u_persistance");
		this.uniformsMap["sampleCoords"] = this.glcontext.getUniformLocation(this.program, "u_sampleCoords");
		this.uniformsMap["posZ"] = this.glcontext.getUniformLocation(this.program, "u_posZ");
	}

	updateUniforms(params): void {
		/*const level = 0;
		const internalFormat = this.glcontext.RGB;
		const border = 0;
		const srcFormat = this.glcontext.RGB;
		const srcType = this.glcontext.UNSIGNED_SHORT_5_6_5;

		this.glcontext.texImage2D(this.glcontext.TEXTURE_2D, level, internalFormat,
			size, size, border, srcFormat, srcType,
						params.coordinatesSample);

		// I dont think this is necesary
		if (IsPowerOf2(size) && IsPowerOf2(size)) {
			// Yes, it's a power of 2. Generate mips.
			this.glcontext.generateMipmap(this.glcontext.TEXTURE_2D);
		} else {
			// No, it's not a power of 2. Turn off mips and set
			// wrapping to clamp to edge
			this.glcontext.texParameteri(this.glcontext.TEXTURE_2D, this.glcontext.TEXTURE_WRAP_S, this.glcontext.CLAMP_TO_EDGE);
			this.glcontext.texParameteri(this.glcontext.TEXTURE_2D, this.glcontext.TEXTURE_WRAP_T, this.glcontext.CLAMP_TO_EDGE);
			this.glcontext.texParameteri(this.glcontext.TEXTURE_2D, this.glcontext.TEXTURE_MIN_FILTER, this.glcontext.LINEAR);
		}*/

		
		
		this.glcontext.uniform1i(this.uniformsMap["seed"], params.seed);
		this.glcontext.uniform1i(this.uniformsMap["octaves"], params.octaves);
		this.glcontext.uniform1i(this.uniformsMap["startingOctave"], params.startingOctave);
		this.glcontext.uniform1i(this.uniformsMap["resolution"], this.size);
		this.glcontext.uniform1f(this.uniformsMap["persistance"], params.persistance);
		this.glcontext.uniform1f(this.uniformsMap["posZ"], params.posZ);
		this.glcontext.uniform1f(this.uniformsMap["lacunarity"], params.lacunarity);

		this.glcontext.uniform1i(this.uniformsMap["sampleCoords"], 0);
	}

}

export {PerlinGenerator, WorleyGenerator, IterativeImageGeneration};