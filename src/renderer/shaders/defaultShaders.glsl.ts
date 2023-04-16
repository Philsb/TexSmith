const DefaultVertexShader: string = 
`#version 300 es
precision mediump float;
in vec2 vertPosition;
out vec2 coord; 

void main()
{
    gl_Position = vec4(vertPosition, 0.0, 1.0);
    coord = vertPosition;
}
`;

const DefaultRenderToScreenShader: string = 
`#version 300 es
precision mediump float;
in vec2 coord;
out vec4 fragColor;

uniform sampler2D screen;
uniform int resolution;

void main(void) {
    vec2 texCoord = vec2(gl_FragCoord)/float(resolution);
    fragColor = texture(screen, texCoord);
}
`;

export {DefaultRenderToScreenShader};
export default DefaultVertexShader;