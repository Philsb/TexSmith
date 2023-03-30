import { GenerateShader, ShaderSource } from "../renderer/shader";
import { IsPowerOf2 } from "./mathUtils";

abstract class GpuImageGenerator {
    renderer: OffscreenCanvas;
    glcontext; 
	texture; 
	shader: ShaderSource;

    constructor(shader: ShaderSource) {
        this.renderer = new OffscreenCanvas(256, 256);
        this.glcontext = this.renderer.getContext("webgl2");

		this.texture = this.glcontext.createTexture();
		this.glcontext.bindTexture(this.glcontext.TEXTURE_2D, this.texture);

		this.shader = shader;
		//Set shader
		let program = this.initShaderProgram();
        this.glcontext.useProgram(program);
    }

	abstract #InitUniforms(): void;

	generateImage(coordinatesSample: Int32Array,width: number, height: number) {

		const level = 0;
		const internalFormat = this.glcontext.RGB;
		const border = 0;
		const srcFormat = this.glcontext.RGB;
		const srcType = this.glcontext.INT;

		this.glcontext.texImage2D(this.glcontext.TEXTURE_2D, level, internalFormat,
						width, height, border, srcFormat, srcType,
						coordinatesSample);

		// I dont think this is necesary
		if (IsPowerOf2(width) && IsPowerOf2(height)) {
			// Yes, it's a power of 2. Generate mips.
			this.glcontext.generateMipmap(this.glcontext.TEXTURE_2D);
		} else {
			// No, it's not a power of 2. Turn off mips and set
			// wrapping to clamp to edge
			this.glcontext.texParameteri(this.glcontext.TEXTURE_2D, this.glcontext.TEXTURE_WRAP_S, this.glcontext.CLAMP_TO_EDGE);
			this.glcontext.texParameteri(this.glcontext.TEXTURE_2D, this.glcontext.TEXTURE_WRAP_T, this.glcontext.CLAMP_TO_EDGE);
			this.glcontext.texParameteri(this.glcontext.TEXTURE_2D, this.glcontext.TEXTURE_MIN_FILTER, this.glcontext.LINEAR);
		}

		let QuadVertices = 
		[ // X, Y, 
			1.0, 1.0,   
			-1.0, -1.0,  
			-1.0, 1.0,  
			-1.0, 1.0,
			-1.0, -1.0,
			1.0, -1.0,   
		];

		let QuadVBO = this.glcontext.createBuffer();
		this.glcontext.bindBuffer(this.glcontext.ARRAY_BUFFER, QuadVBO);
		this.glcontext.bufferData(this.glcontext.ARRAY_BUFFER, new Float32Array(QuadVertices), this.glcontext.STATIC_DRAW);

		let positionAttribLocation = this.glcontext.getAttribLocation(program, 'vertPosition');

		this.glcontext.vertexAttribPointer(
			positionAttribLocation, // Attribute location
			2, // Number of elements per attribute
			this.glcontext.FLOAT, // Type of elements
			this.glcontext.FALSE,
			2 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
			0 // Offset from the beginning of a single vertex to this attribute
		);
		this.glcontext.enableVertexAttribArray(positionAttribLocation);


		this.InitUniforms();

		gl.clearColor(0.0, 0.0, 0.0, 0.0);    
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
		this.glcontext.drawArrays(this.glcontext.TRIANGLES, 0, 6);

	}
    
    #initShaderProgram() {
		//
		// Create shaders
		//
		let shaderText = GenerateShader(this.shader)

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

		let program = this.glcontext.createProgram();
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

    resize(canvas) {
		// Lookup the size the browser is displaying the canvas.
		let displayWidth  = canvas.clientWidth;
		let displayHeight = canvas.clientHeight;
	
		// Check if the canvas is not the same size.
		if (canvas.width  != displayWidth ||
			canvas.height != displayHeight) {
	
			// Make the canvas the same size
			canvas.width  = displayWidth;
			canvas.height = displayHeight;
		}
	}

}

class PerlinImageGenerator extends GpuImageGenerator {
	constructor () {
		
		let perlinShader = {
			functions: {
NoisesRNG: 	
,
fade: 
`
float fade() {
	SmoothStep: (a,b,alpha) => {
        //SmoothStep Interpolation
        return (b - a) * ((alpha * (alpha * 6.0 - 15.0) + 10.0) * alpha * alpha * alpha) + a;
    }
}
`


},
			vertex: `
				asd;
			
			`,
			fragment: `
			
			
			
			`
		}
		super(perlinShader);
		seed: number, posZ: number, resolution: number, octaves: number, startingOctave: number, lacunarity: number, persistance: number, fade, octaveMix
		
	}
	#InitUniforms() {
		
	}


}