import React, { useState } from 'react';

// MUI
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

function CompountInterestCalculator() {
  const [initialInvestment, setInitialInvestment] = useState('');
  const [monthlyContributions, setMonthlyContributions] = useState('');
  const [years, setYears] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [result, setResult] = useState('');

  const numberRegex = /^[0-9\b]+$/;

  const handleInitialInvestmentChange = (event) => {
    if (event.target.value === '' || numberRegex.test(event.target.value)) {
      const updatedInitialInvestment = event.target.value;
      setInitialInvestment(updatedInitialInvestment);
    } else return;
  };

  const handleMonthlyContributionsChange = (event) => {
    if (event.target.value === '' || numberRegex.test(event.target.value)) {
      const updatedMonthlyContributions = event.target.value;
      setMonthlyContributions(updatedMonthlyContributions);
    } else return;
  };

  const handleYearsChange = (event) => {
    if (event.target.value === '' || numberRegex.test(event.target.value)) {
      const updatedYears = event.target.value;
      setYears(updatedYears);
    } else return;
  };

  const handleInterestRateChange = (event) => {
    if (event.target.value === '' || numberRegex.test(event.target.value)) {
      const updatedInterestRate = event.target.value;
      setInterestRate(updatedInterestRate);
    } else return;
  };

  const calculateRateOfReturn = () => {
    if (initialInvestment && years && interestRate) {
      let endResult = initialInvestment;
      for (let i = 1; i <= years; i++) {
        endResult =
          endResult * (1 + interestRate / 100) + monthlyContributions * 12;
      }
      setResult(
        endResult
        // initialInvestment * Math.pow(1 + interestRate / 100, years) +
        //   monthlyContributions * 12 * years

        //   monthlyContributions * (years * 12)
      );
    } else return;
  };

  return (
    <Container>
      <div style={{ display: 'flex', flexDirection: 'column', padding: '5px' }}>
        <TextField
          value={initialInvestment}
          onChange={handleInitialInvestmentChange}
          placeholder="Enter your initial investment"
        />
        <TextField
          value={monthlyContributions}
          onChange={handleMonthlyContributionsChange}
          placeholder="Enter your monthly contributions"
        />
        <TextField
          value={years}
          onChange={handleYearsChange}
          placeholder="Enter the length in time in years to examine"
        />
        <TextField
          value={interestRate}
          onChange={handleInterestRateChange}
          placeholder="Enter the estimated interest rate"
        />
        <Button
          color="primary"
          variant="contained"
          onClick={calculateRateOfReturn}
        >
          Calculate
        </Button>
      </div>
      <h1>
        $
        {result.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </h1>
    </Container>
  );
}

export default CompountInterestCalculator;
