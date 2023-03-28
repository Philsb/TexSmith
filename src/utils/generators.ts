class GpuImageGenerator {
    renderer: OffscreenCanvas;
    glcontext: OffscreenRenderingContext; 

    /*constructor() {
        this.renderer = new OffscreenCanvas(256, 256);
        this.glcontext = this.renderer.getContext("webgl");

        var triangleVertexBufferObject = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesInfo), gl.STATIC_DRAW);

        var positionAttribLocation = gl.getAttribLocation(shaderProgram, 'vertPosition');

        gl.vertexAttribPointer(
			positionAttribLocation, // Attribute location
			3, // Number of elements per attribute
			gl.FLOAT, // Type of elements
			gl.FALSE,
			6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
			0 // Offset from the beginning of a single vertex to this attribute
		);

        gl.enableVertexAttribArray(positionAttribLocation);
    }*/
    /*
    initShaderProgram(gl) {
		//
		// Create shaders
		// 
		var vertexShaderText = loadTextResource ('./src/Shaders/vertex.shader');
		var fragmentShaderText = loadTextResource ('./src/Shaders/fragment.shader');
		var vertexShader = gl.createShader(gl.VERTEX_SHADER);
		var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

		gl.shaderSource(vertexShader, vertexShaderText);
		gl.shaderSource(fragmentShader, fragmentShaderText);

		gl.compileShader(vertexShader);
		if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
			console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
			return;
		}

		gl.compileShader(fragmentShader);
		if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
			console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
			return;
		}

		var program = gl.createProgram();
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error('ERROR linking program!', gl.getProgramInfoLog(program));
			return;
		}
		gl.validateProgram(program);
		if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
			console.error('ERROR validating program!', gl.getProgramInfoLog(program));
			return;
		}

		return program;
	}

    resize(canvas) {
		// Lookup the size the browser is displaying the canvas.
		var displayWidth  = canvas.clientWidth;
		var displayHeight = canvas.clientHeight;
	
		// Check if the canvas is not the same size.
		if (canvas.width  != displayWidth ||
			canvas.height != displayHeight) {
	
		// Make the canvas the same size
		canvas.width  = displayWidth;
		canvas.height = displayHeight;
		}
	}*/

}