// React Router
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

// Components
import Navbar from './components/Navbar/Navbar';
import SavingsRateCalculator from './containers/SavingsRateCalculator/SavingsRateCalculator';
import CompountInterestCalculator from './containers/CompoundInterestCalculator/CompountInterestCalculator';
import D3Render from './containers/MonteCarlo/D3render';

function App() {
  return (
    <Router>
      <Navbar />
      <Switch>
        <Route exact path="/" component={SavingsRateCalculator} />
        <Route exact path="/savingsrate" component={SavingsRateCalculator} />
        <Route
          exact
          path="/compoundinterest"
          component={CompountInterestCalculator}
        />
        <Route exact path="/stocksim" component={D3Render} />
      </Switch>
    </Router>
  );
}

export default App;
