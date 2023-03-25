import logo from './logo.svg';
import { useRef, useEffect} from 'react';
import './App.css';
import { Noise } from './utils/noises';
import { Clamp, Interpolation } from './utils/mathUtils';
import { EvaluateColorGradient, NormalizeToRanges} from './utils/transforms';
import CustomCanvas from './components/canvas';



const paintCanvas = (canvasRef, imgSize) => {
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
