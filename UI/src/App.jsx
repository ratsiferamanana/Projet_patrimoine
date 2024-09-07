import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PossessionPage from './Pages/Possession/possession';
import PatrimoinePage from './Pages/Patrimoine/patrimoine'; //
import Header from "./components/header.jsx";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<PossessionPage />} />
        <Route path="/patrimoine" element={<PatrimoinePage />} />
        <Route path="/possession" element={<PossessionPage />} />
      </Routes>
    </Router>
  );
}

export default App;
