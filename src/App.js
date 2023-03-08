import logo from './logo.svg';
import { useRef, useEffect} from 'react';
import './App.css';
import CustomCanvas from './components/canvas';
import { ContextExclusionPlugin } from 'webpack';

function App() {

  const canvasRef = useRef(null);
  
  
  
  /*useEffect(() => {
    let canvasContext = canvasRef.current.getContext("2d");
    canvasContext.beginPath();
    canvasContext.rect(0, 0, 512, 512);
    canvasContext.fillStyle = "blue";
    canvasContext.fill();
  }, []);*/
   

  return (
    <div className="App">
      <h1>Hello canvas</h1>
      <canvas ref={canvasRef} width="512" height="512"></canvas>
    </div>
  );
}

export default App;
