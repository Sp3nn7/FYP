
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css';
import Navigation from './Navigation'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import {defTrendState, Trend} from './pages/Trend';
import {defPCState, PriceComp} from './pages/PriceComp';
import { useState } from "react";
import Help from './components/Help';
function App() {
  const [trendState, setTrendState] = useState(defTrendState);
  const [PCState, setPCState] = useState(defPCState);
  const [helpState, setHelpState] = useState(null);
  return (
    <Router>
      <div className="App">
      <Help page={helpState} setHelp={setHelpState}/>
      <Navigation setHelp={setHelpState}/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<Home />} />
          <Route path="/price-comp" element={<PriceComp active={PCState} setActive={setPCState} />} />
          <Route path="/trend" element={<Trend active={trendState} setActive={setTrendState} />} />
        </Routes>
      </div>
    </Router>
    
  );
}

export default App;
