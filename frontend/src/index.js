import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Index from './App';
import Texts from './Texts';
import reportWebVitals from './reportWebVitals';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";


if (module.hot) module.hot.accept()

export default function App() {
  return (
    <BrowserRouter basename="/">
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path=":urlId" element={<Texts />} />
      <Route path="*" element={<Texts />} />
    </Routes>
  </BrowserRouter>
  );
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
