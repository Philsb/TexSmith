import logo from './logo.svg';
import { useRef, useEffect} from 'react';
import './App.css';
import perlin from './utils/noises';
import { Interpolation } from './utils/mathUtils';
import { NormalizeRanges} from './utils/transforms';
import CustomCanvas from './components/canvas';

function App() {

  const canvasRef = useRef(null);
  const imgSize = 512;
  
  
  useEffect(() => {
    const canvasContext = canvasRef.current.getContext("2d");
    
    

    let valueArrayOctave2 = perlin(0 , imgSize, 8, Interpolation.SmoothStep)
    .map(x => x/2);

    let valueArrayOctave3 = perlin(0 , imgSize, 16, Interpolation.SmoothStep)
    .map(x => x/4);

    let valueArrayOctave4 = perlin(0 , imgSize, 32, Interpolation.SmoothStep)
    .map(x => x/8);

    let valueArrayOctave1 = perlin(0 , imgSize, 4, Interpolation.SmoothStep)
    .map((x,i) => Interpolation.Circle(0,1,x) + valueArrayOctave2[i] + valueArrayOctave3[i] + valueArrayOctave4[i]);


    const arr = new Uint8ClampedArray(imgSize*imgSize*4);
    valueArrayOctave1.map((value,index)=>{
      let newVal = Math.round(value * 255);
      arr[(index*4)] = newVal;
      arr[(index*4)+1] = newVal;
      arr[(index*4)+2] = newVal;
      arr[(index*4)+3] = 255;

    });
    let imageData = new ImageData(arr, imgSize);
    console.log(imageData);
    canvasContext.putImageData(imageData, 0, 0);
  }, []);
   

  return (
    <div className="App">
      <h1>Hello canvas</h1>
      <canvas ref={canvasRef} width={imgSize} height={imgSize}></canvas>
    </div>
  );
}

export default App;
