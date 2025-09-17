import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/vqm-philosophy-explorer/" element={<HomePage />} />
      </Routes>
    </div>
  );
}

export default App;