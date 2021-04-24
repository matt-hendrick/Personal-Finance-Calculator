// Components
import Navbar from './components/Navbar/Navbar';
import TaxRateCalculator from './containers/TaxRateCalculator/TaxRateCalculator';
import SavingsRateCalculator from './containers/SavingsRateCalculator/SavingsRateCalculator';

function App() {
  return (
    <div>
      <Navbar />
      <SavingsRateCalculator />
      {/* <TaxRateCalculator /> */}
    </div>
  );
}

export default App;
