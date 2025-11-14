import Navbar from './components/Navbar';
import RBIGuideline from './components/RBIGuideline';
import EMICalculator from './components/EMICalculator';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <EMICalculator />
      <RBIGuideline />
      <Footer />
    </div>
  );
}

export default App;
