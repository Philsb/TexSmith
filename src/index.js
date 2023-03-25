import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { paintCanvas } from './App';
import reportWebVitals from './reportWebVitals';


const imageSize = 720*2;
const root = document.getElementById('root');
const canvas = root.appendChild(document.createElement("canvas"));
canvas.width = imageSize;
canvas.height = imageSize;
paintCanvas(canvas, imageSize);

/*const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);*/

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
