const DefaultVertexShader: string = `
#version 300 es
precision mediump float;
in vec2 vertPosition;
out vec2 coord; 

void main()
{
    gl_Position = vec4(vertPosition, 0.0, 1.0);
    coord = vertPosition;
}
`;

const DefaultRenderToScreenShader: string = `
    precision mediump float;
    uniform sampler2D state;
    void main(void) {
        vec2 coord = vec2(gl_FragCoord)/64.0;
        gl_FragColor = texture2D(state, coord);
    }
`;

export {DefaultRenderToScreenShader};
export default DefaultVertexShader;