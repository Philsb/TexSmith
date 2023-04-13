interface GlslType {
    name: string,
    type: string,
    descriptor?: "attribute" | "uniform" | "varying";
}

interface GlslFunction {
    name?: string,
    //out: GlslType,
    //params: GlslType[],
    definition: string,

}

interface ShaderSource {
    //attributes?: string[],
    functions: Object,
    vertex: string,
    fragment: string
}

function GenerateFunction (func: GlslFunction, customName: string = null) {
    if (customName == null && func.name == null)
        return "Error: no function name specified."

    let name = customName == null ? func.name : customName;
    return func.definition.replace(/#{fun}/g, name);
}

function GenerateShader(shader: ShaderSource) : {vertex: string, fragment: string}
{
    let vertexString: string = shader.vertex;
    let fragmentString: string = shader.fragment;
    
    let shaderFuncs = Object.keys(shader.functions);
    shaderFuncs.forEach ((key) => {
        let regexDecl = new RegExp(`#${key}\s*\n`,"g");
        let regexCall = new RegExp(`\$${key}`,"g");
        vertexString = vertexString.replace(regexDecl, shader.functions[key]);
        fragmentString = fragmentString.replace(regexDecl, shader.functions[key]);
    });

    return {
        vertex: vertexString, 
        fragment: fragmentString
    };
}

export {GenerateShader, GenerateFunction, ShaderSource, GlslFunction};