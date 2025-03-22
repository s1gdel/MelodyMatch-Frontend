
import './App.css';
import Home from './components/Home';
import Display from './components/Display';
import { BrowserRouter as Router,Routes,Route} from 'react-router-dom';
function App() {


  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/display.tsx" element={<Display />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
     
  )
}

export default App
