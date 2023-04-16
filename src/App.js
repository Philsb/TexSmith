import logo from './logo.svg';
import { useRef, useEffect} from 'react';
import './App.css';
import loadNoise from './utils/noises';
import { Clamp, Interpolation } from './utils/mathUtils';
import { EvaluateColorGradient, NormalizeToRanges} from './utils/transforms';
import {IterativeImageGeneration, PerlinGenerator, WorleyGenerator} from './utils/generators';
import CustomCanvas from './components/canvas';
import { GenerateShader } from './renderer/shader';

const paintCanvas = async (canvasRef, imgSize) => {
  //const canvasContext = canvasRef.getContext("2d");
  let iterImage = new IterativeImageGeneration(imgSize, canvasRef);
  iterImage.generateImage({});

  if (false) {
    let genImg = function (time) {
      b += 0.01;
      let pixelsWorley = worleyGenerator.generateImage({
        coordinatesSample: null,
        seed: 4,
        startingOctave: 2, 
        octaves: 5,
        lacunarity: 2,
        persistance: 1.88,
        posZ:0   
      });
  
      let pixelsPerlin = perlinGenerator.generateImage({
        coordinatesSample: null,
        seed: 64,
        startingOctave: 3, 
        octaves: 6,
        lacunarity: 2,
        persistance: 2,
        posZ:1   
      }).map((x,i) => {
        return Math.abs(x-0.5) * 2;
      });
  
      let pixels = new Float32Array(imgSize*imgSize);
      for(let j = 0; j < imgSize*imgSize; j++) {
        
        pixels[j] = Interpolation.SmoothStep(pixelsPerlin[j], pixelsWorley[j], 0.5);
      }
  
      /*let pixels = generator.generateImage({
        coordinatesSample: null,
        seed: 60,
        startingOctave: 2, 
        octaves: 10,
        lacunarity: 3,
        persistance: Math.cos(b)*0.5 + 1.7,
        posZ: b/10 % 1
      }).map((x,i) => {
        return Math.sin( 5*2*Math.PI * (i%imgSize/imgSize + 0.5*x));  
      });*/
      
  
      /*let pixels = perlinGenerator.generateImage({
        coordinatesSample: null,
        seed: 60,
        startingOctave: 2, 
        octaves: 10,
        lacunarity: 1.8,
        persistance: 1.6,
        posZ: 0.3
      })/*.map((x,i) => {
        return Math.sin( 7*2*Math.PI * (i%imgSize/imgSize + 0.5*x));  
      });*/
      
      
      const arr = new Uint8ClampedArray(imgSize*imgSize*4);
      for (let index = 0; index < pixels.length; index++) {
        arr[index*4] = pixels[index] * 255;
        arr[index*4+1] = pixels[index] * 255;
        arr[index*4+2] = pixels[index] * 255;
        arr[index*4+3] = 255;
      }
  
      let imageData = new ImageData(arr, imgSize);
      canvasContext.putImageData(imageData, 0, 0);
      requestAnimationFrame(genImg);
    }
  
    requestAnimationFrame(genImg);
  }
  
  if (false) {
    let Noise = await loadNoise;

    console.log("Before Noise", performance.now());
    const canvasContext = canvasRef.getContext("2d");

    /*let valueArray = Noise.WorleyTexture2D({seed: 16 , 
                  posZ: 0, 
                  resolution: imgSize, 
                  startingOctave: 1, 
                  octaves: 10, 
                  fade: Interpolation.Lerp,
                  lacunarity: 3,
                  octaveMix: (value, octaveIteration, x, y) => {
                    return (value - (0.5 * Clamp(octaveIteration, 0 , 1))   ) / 2**(octaveIteration);
                  }
                  //octaveMix: (value, octaveIteration, x, y) => {return Clamp(value / 1.7**(octaveIteration), -1, 1);}
                }).map((x,i) => {
                  return (1-Math.cos(  16*2*Math.PI * ((i%imgSize)/imgSize  + 0.6*x)))/(1-x);  
                });
    */         

    let valueArray = Noise.PerlinTexture2D({seed: 16, 
                                            posZ: 0, 
                                            resolution: imgSize, 
                                            startingOctave: 1, 
                                            octaves: 8, 
                                            fade: Interpolation.SmoothStep,
                                            octaveMix: (value, octaveIteration, x, y) => {return value / 2**(octaveIteration);}
                                            //octaveMix: (value, octaveIteration, x, y) => {return Clamp(value / 1.7**(octaveIteration), -1, 1);}
                                          }).map((x,i) => {
                                            return (1-Math.cos(  16*2*Math.PI * ((i%imgSize)/imgSize  + 0.6*x)))/(1-x);  
                                          });

    /*let valueArray = Noise.WorleyTexture2D({seed: 16 , 
                                            posZ: 0, 
                                            resolution: imgSize, 
                                            startingOctave: 1, 
                                            octaves: 10, 
                                            fade: Interpolation.Lerp,
                                            lacunarity: 3,
                                            octaveMix: (value, octaveIteration, x, y) => {
                                              return (value - (0.5 * Clamp(octaveIteration, 0 , 1))   ) / 2**(octaveIteration);
                                            }
                                            //octaveMix: (value, octaveIteration, x, y) => {return Clamp(value / 1.7**(octaveIteration), -1, 1);}
    }).map((x,i) => {
      return (1-Math.cos(  16*2*Math.PI * ((i%imgSize)/imgSize  + 0.6*x)))/(1-x);  
    });*/
                                          
    const arr = new Uint8ClampedArray(imgSize*imgSize*4);

    console.log("After Noise", performance.now());

    valueArray.map((value,index)=>{

      let color = EvaluateColorGradient(Clamp( value, 0 , 1), [
        {x: 0.0, color: [0,63,178]},
        {x: 0.3, color: [10,80,195]},
        {x: 0.4, color: [192,183,134]},
        {x: 0.45, color: [135,120,66]},
        {x: 0.48, color: [59,97,18]},
        {x: 0.5, color: [89,127,53]},
        {x: 0.6, color: [120,157,81]},
        {x: 0.7, color: [140,141,120]},
        {x: 0.8, color: [158,161,142]},
        {x: 0.9, color: [236,236,236]},
        {x: 1.0, color: [255,255,255]},

      ],
      Interpolation.Lerp
      );

      let newVal = Math.round(value * 255);
      arr[(index*4)] =  newVal; //  newVal; //color[0];
      arr[(index*4)+1] = newVal; // newVal; //color[1];
      arr[(index*4)+2] = newVal; // newVal; //color[2];
      arr[(index*4)+3] = 255;

    });


    let imageData = new ImageData(arr, imgSize);

    canvasContext.putImageData(imageData, 0, 0);

    console.log("After Put image data", performance.now());
  }
};

function App() {

  const canvasRef = useRef(null);
  const imgSize = 2048;
  
  
  useEffect(() => {

    const imgSize = 2048;
    console.log("Before Noise", performance.now());
    const canvasContext = canvasRef.current.getContext("2d");
    
    /*let valueArray = NormalizeToRanges(Noise.PerlinTexture2D({seed: 16 , 
                                            posZ: 0, 
                                            resolution: imgSize, 
                                            startingOctave: 1, 
                                            octaves: 1, 
                                            fade: Interpolation.SmoothStep,
                                            octaveMix: (value, octaveIteration, x, y) => {return Math.abs(value / 1.4**(octaveIteration));}
                                            //octaveMix: (value, octaveIteration, x, y) => {return Clamp(value / 1.7**(octaveIteration), -1, 1);}
                                          }), 0 , 1).map(x=>Interpolation.Circle(0,1,x));
    */                              
   
    let valueArray = Noise.PerlinTexture2D({seed: 16, 
                                            posZ: 0, 
                                            resolution: imgSize, 
                                            startingOctave: 1, 
                                            octaves: 3, 
                                            fade: Interpolation.SmoothStep,
                                            octaveMix: (value, octaveIteration, x, y) => {return value / 2**(octaveIteration);}
                                            //octaveMix: (value, octaveIteration, x, y) => {return Clamp(value / 1.7**(octaveIteration), -1, 1);}
                                          });
                                          
    const arr = new Uint8ClampedArray(imgSize*imgSize*4);

    console.log("After Noise", performance.now());
    
    valueArray.map((value,index)=>{

      /*let color = EvaluateColorGradient(value, [
        {x: 0.0, color: [0,63,178]},
        {x: 0.3, color: [10,80,195]},
        {x: 0.4, color: [192,183,134]},
        {x: 0.45, color: [135,120,66]},
        {x: 0.48, color: [59,97,18]},
        {x: 0.5, color: [89,127,53]},
        {x: 0.6, color: [120,157,81]},
        {x: 0.7, color: [140,141,120]},
        {x: 0.8, color: [158,161,142]},
        {x: 0.9, color: [236,236,236]},
        {x: 1.0, color: [255,255,255]},

      ],
      Interpolation.Lerp
      );*/

      let newVal = Math.round(value * 255);
      arr[(index*4)] = newVal;
      arr[(index*4)+1] = newVal;
      arr[(index*4)+2] = newVal;
      arr[(index*4)+3] = 255;

    });

    
    let imageData = new ImageData(arr, imgSize);

    canvasContext.putImageData(imageData, 0, 0);

    console.log("After Put image data", performance.now());
  }, []);
   

  return (
    <div className="App">
      <h1>Hello canvas</h1>
      <canvas ref={canvasRef} width={imgSize} height={imgSize}></canvas>
    </div>
  );
}

export {paintCanvas};
export default App;
