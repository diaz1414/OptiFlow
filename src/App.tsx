import Navbar from './components/Navbar';
import Hero from './components/Hero';
import UploadZone from './components/UploadZone';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-[#030014] text-white selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <div className="relative z-10 font-sans">
        <Navbar />
        
        <main className="container mx-auto">
          <Hero />
          <UploadZone />
          <HowItWorks />
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
