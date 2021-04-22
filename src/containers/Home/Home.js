import React, { useState } from 'react';

import { RegionDropdown } from 'react-country-region-selector';
import axios from 'axios';

function Home() {
  const [yearlyIncome, setYearlyIncome] = useState('');
  const [selectedState, setSelectedState] = useState(null);
  const [filingStatus, setFilingStatus] = useState('single');
  const [taxData, setTaxData] = useState(null);

  const handleYearlyIncomeChange = (event) => {
    const regex = /^[0-9\b]+$/;
    if (event.target.value === '' || regex.test(event.target.value)) {
      const updatedYearlyIncome = event.target.value;
      setYearlyIncome(updatedYearlyIncome);
    } else return;
  };

  const handleFilingStatusChange = (event) => {
    const updatedFilingStatus = event.target.value;
    setFilingStatus(updatedFilingStatus);
  };

  const handleSelectedStateChange = (val) => {
    const updatedSelectedState = val;
    setSelectedState(updatedSelectedState);
  };

  const calculateTaxRates = () => {
    const params = {
      pay_rate: yearlyIncome,
      filing_state: filingStatus,
      state: selectedState,
    };
    if (yearlyIncome && selectedState) {
      axios
        .get('/TaxRates', {
          params: params,
        })
        .then((response) => {
          setTaxData(response);
        })
        .catch((error) => {
          console.error(error.message);
        });
    } else return;
  };

  if (taxData) console.log(taxData);

  return (
    <div>
      <input
        value={yearlyIncome}
        onChange={handleYearlyIncomeChange}
        placeholder="Enter your gross yearly income"
      />
      <RegionDropdown
        country="United States"
        value={selectedState}
        valueType="short"
        defaultOptionLabel="Select State"
        onChange={(val) => handleSelectedStateChange(val)}
      />
      <select value={filingStatus} onChange={handleFilingStatusChange}>
        <option value="single">Single</option>
        <option value="married">Married</option>
        <option value="married_separately">Married Separately</option>
        <option value="head_of_household">Head of Household</option>
      </select>
      <div>
        <button
          onClick={calculateTaxRates}
          disabled={!selectedState || !yearlyIncome}
        >
          Calculate Tax Rates
        </button>
      </div>
      <div>Gross Yearly Income = {yearlyIncome}</div>
    </div>
  );
}

export default Home;
