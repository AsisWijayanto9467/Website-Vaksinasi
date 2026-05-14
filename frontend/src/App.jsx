import React from 'react'
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Login from './Pages/Auth/Login';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />}/>
      </Routes>
    </Router>
  )
}
