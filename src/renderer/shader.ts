interface GlslType {
    name: string,
    type: string,
    descriptor?: "attribute" | "uniform" | "varying";
}

interface GlslFunction {
    out: GlslType,
    params: GlslType[],
    descriptor?: "attribute" | "uniform" | "varying";
}

interface ShaderSource {
    //attributes?: string[],
    functions: Object,
    vertex: string,
    fragment: string
}

function GenerateShader(shader: ShaderSource) : {vertex: string, fragment: string}
{
    let vertexString: string = shader.vertex;
    let fragmentString: string = shader.fragment;
    
    let shaderFuncs = Object.keys(shader.functions);
    shaderFuncs.forEach ((key) => {
        let regexDecl = new RegExp(`#${key}\s*\n`,"g")
        let regexCall = new RegExp(`\$${key}`,"g")
        vertexString = vertexString.replace(regexDecl, shader.functions[key]);
        fragmentString = fragmentString.replace(regexDecl, shader.functions[key]);
    });

    return {
        vertex: vertexString, 
        fragment: fragmentString
    };
}

export {GenerateShader, ShaderSource};