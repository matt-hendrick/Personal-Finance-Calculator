// React Router
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

// Components
import Navbar from './components/Navbar/Navbar';
import SavingsRateCalculator from './containers/SavingsRateCalculator/SavingsRateCalculator';
import CompountInterestCalculator from './containers/CompoundInterestCalculator/CompountInterestCalculator';

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
      </Switch>
    </Router>
  );
}

export default App;
