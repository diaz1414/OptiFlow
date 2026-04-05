import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Converter from './pages/Converter';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#030014] text-white selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden">
        {/* Dynamic Background Elements */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] animate-pulse" />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[100px]" />
        </div>

        <div className="relative z-10 font-sans flex flex-col min-h-screen">
          <Navbar />
          
          <main className="flex-grow">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/converter" element={<Converter />} />
              </Routes>
            </AnimatePresence>
          </main>

          <Footer />
        </div>
      </div>
    </Router>
  );
}

export default App;
