import { useState } from 'react'
import CesiumMap  from './components/CesiumMap';
import { useMeteo } from './hooks/useMeteo';
import get_aqi from './utils/get_aqi';
import './App.css'

function App() {

    get_aqi({
        lat: -99,
        lon: 36,
    });

    return (
        <>
        <div className="div">
            <CesiumMap />
                    <div className="top-right">BLA BLA</div>
                    <div className="top-left">BLA BLA</div>
                    <div className="bottom-right">BOB bob</div>
                    <div className="bottom-left">BOb bob</div>
        </div>
        </>
  )
}

export default App
