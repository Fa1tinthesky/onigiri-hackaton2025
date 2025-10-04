import { useState } from 'react'
import CesiumMap  from './components/CesiumMap';
import './App.css'

function App() {
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
