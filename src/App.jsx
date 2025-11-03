import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <div>
        <Routes>
          <Route path="/vqm-philosophy-explorer/" element={<HomePage />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;