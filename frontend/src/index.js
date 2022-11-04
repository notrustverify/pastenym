import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import UserInput from './UserInput'
import Texts from './Texts'
import reportWebVitals from './reportWebVitals'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

if (module.hot) module.hot.accept()

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<UserInput />} />
                <Route path="/protec" element={<UserInput />} />
                <Route path=":urlId" element={<Texts />} />
                <Route path="*" element={<Texts />} />
            </Routes>
        </BrowserRouter>
    )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)

//to create pwa application, uncomment
/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/service-worker.js')
            .then((registration) => {
                console.log('SW registered: ', registration)
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError)
            })
    })
}*/

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals(console.log);
