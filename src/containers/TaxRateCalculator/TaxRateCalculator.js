import React, { useState } from 'react';

import { RegionDropdown } from 'react-country-region-selector';
import axios from 'axios';

// MUI
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

function TaxRateCalculator() {
  const [yearlyIncome, setYearlyIncome] = useState('');
  const [selectedState, setSelectedState] = useState(null);
  const [filingStatus, setFilingStatus] = useState('single');
  const [taxData, setTaxData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [contribution401k, setContribution401k] = useState('');
  const [contributionIRA, setContributionIRA] = useState('');
  const [contributionHSA, setContributionHSA] = useState('');

  const numberRegex = /^[0-9\b]+$/;

  const handleYearlyIncomeChange = (event) => {
    if (event.target.value === '' || numberRegex.test(event.target.value)) {
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

  const handleContribution401kChange = (event) => {
    if (event.target.value === '' || numberRegex.test(event.target.value)) {
      const updatedContribution401k = event.target.value;
      setContribution401k(updatedContribution401k);
    } else return;
  };

  const handleContributionIRAChange = (event) => {
    if (event.target.value === '' || numberRegex.test(event.target.value)) {
      const updatedContributionIRA = event.target.value;
      setContributionIRA(updatedContributionIRA);
    } else return;
  };

  const handleContributionHSAChange = (event) => {
    if (event.target.value === '' || numberRegex.test(event.target.value)) {
      const updatedContributionHSA = event.target.value;
      setContributionHSA(updatedContributionHSA);
    } else return;
  };

  let totalContributions = 0;
  if (contribution401k) totalContributions += parseInt(contribution401k);
  if (contributionIRA) totalContributions += parseInt(contributionIRA);
  if (contributionHSA) totalContributions += parseInt(contributionHSA);
  const adjustedIncome = yearlyIncome - parseInt(totalContributions);

  const calculateTaxRates = () => {
    setLoading(true);
    const params = {
      pay_rate: adjustedIncome,
      filing_status: filingStatus,
      state: selectedState,
    };
    if (yearlyIncome && selectedState) {
      axios
        .get(
          'http://localhost:5001/personalfinancecalculator/us-central1/app/TaxRates',
          {
            params: params,
          }
        )
        .then((response) => {
          setTaxData(response?.data?.annual);
          setLoading(false);
        })
        .catch((error) => {
          console.error(error.message);
          setLoading(false);
        });
    } else setLoading(false);
  };

  let ficaTaxes, federalTaxes, stateTaxes, totalTaxes, totalTakeHome;
  if (taxData) {
    ficaTaxes = taxData.fica.amount;
    federalTaxes = taxData.federal.amount;
    stateTaxes = taxData.state.amount;
    totalTaxes =
      taxData.fica.amount + taxData.federal.amount + taxData.state.amount;
    totalTakeHome = adjustedIncome - totalTaxes;
  }

  return (
    <Container>
      <div>
        <div
          style={{ display: 'flex', flexDirection: 'column', padding: '5px' }}
        >
          <TextField
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
        </div>
        <div
          style={{ display: 'flex', flexDirection: 'column', padding: '5px' }}
        >
          <TextField
            value={contribution401k}
            onChange={handleContribution401kChange}
            placeholder="Enter your yearly personal 401k contribution"
          />
          <TextField
            value={contributionIRA}
            onChange={handleContributionIRAChange}
            placeholder="Enter your yearly IRA contribution"
          />
          <TextField
            value={contributionHSA}
            onChange={handleContributionHSAChange}
            placeholder="Enter your yearly HSA contribution"
          />
        </div>
        <div>
          <Button
            variant="contained"
            color="primary"
            onClick={calculateTaxRates}
            disabled={!selectedState || !yearlyIncome}
          >
            Calculate Tax Rates
          </Button>
        </div>
      </div>
      <div style={{ paddingTop: '70px' }}>
        <div>Gross Yearly Income = {yearlyIncome}</div>
        {taxData ? (
          <div>
            <div>Federal = ${federalTaxes}</div>
            <div>FICA = ${ficaTaxes}</div>
            {stateTaxes ? (
              <div>State = ${stateTaxes}</div>
            ) : (
              <div>No State Taxes in {selectedState}</div>
            )}
            <div>Total Yearly Income Tax = ${totalTaxes}</div>
            <div>Total Yearly Take Home = ${totalTakeHome}</div>
            <div>
              Total Yearly Retirement Contributions = ${totalContributions}
            </div>
            <div>
              Effective Income Tax Rate ={' '}
              {(totalTaxes / yearlyIncome).toFixed(2) * 100}%
            </div>
          </div>
        ) : loading ? (
          <div>Loading...</div>
        ) : null}
      </div>
    </Container>
  );
}

export default TaxRateCalculator;
