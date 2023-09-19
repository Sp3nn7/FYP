
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css';
import Navigation from './Navigation'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Trend from './pages/Trend';
import PriceComp from './pages/PriceComp';

function App() {

  return (
    <Router>
      <div className="App">
      <Navigation/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<Home />} />
          <Route path="/price-comp" element={<PriceComp />} />
          <Route path="/trend" element={<Trend />} />
        </Routes>
      </div>
    </Router>
    
  );
}

export default App;
