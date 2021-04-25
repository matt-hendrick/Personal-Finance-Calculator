import React, { useState, Fragment } from 'react';

import { RegionDropdown } from 'react-country-region-selector';
import axios from 'axios';

// MUI
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import LinearProgress from '@material-ui/core/LinearProgress';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

function SavingsRateCalculator() {
  const [yearlyIncome, setYearlyIncome] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [filingStatus, setFilingStatus] = useState('single');
  const [taxData, setTaxData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [contribution401k, setContribution401k] = useState('');
  const [contributionIRA, setContributionIRA] = useState('');
  const [contributionHSA, setContributionHSA] = useState('');
  const [inputList, setInputList] = useState([
    { expenseName: '', expenseCost: 0 },
  ]);
  const [dialogOpen, setDialogOpen] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [totalFixedExpenses, setTotalFixedExpenses] = useState(0);

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

  const handleInputListChange = (event, index) => {
    const { name, value } = event.target;
    const list = [...inputList];
    list[index][name] = value;
    setInputList(list);
  };

  const handleRemoveClick = (index) => {
    const list = [...inputList];
    list.splice(index, 1);
    setInputList(list);
  };

  const handleAddClick = () => {
    setInputList([...inputList, { expenseName: '', expenseCost: 0 }]);
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setActiveStep(0);
    setDialogOpen(false);
  };

  const handleNextDialogStep = () => {
    const updatedDialogStep = activeStep;
    setActiveStep(updatedDialogStep + 1);
  };

  const handlePreviousDialogStep = () => {
    const updatedDialogStep = activeStep;
    setActiveStep(updatedDialogStep - 1);
  };

  const calculateTotalFixedExpenses = () => {
    setTotalFixedExpenses(
      inputList.reduce((accumulator, currentValue) => {
        return accumulator + parseInt(currentValue.expenseCost);
      }, 0)
    );
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
          'http://localhost:5000/personalfinancecalculator/us-central1/app/TaxRates',
          {
            params: params,
          }
        )
        .then((response) => {
          setTaxData(response?.data?.annual);
          calculateTotalFixedExpenses();
          setLoading(false);
          setDialogOpen(false);
        })
        .catch((error) => {
          console.error(error.message);
          setLoading(false);
        });
    } else {
      setLoading(false);
      setDialogOpen(false);
    }
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

  let stepDisplayed = (
    <Fragment>
      <DialogContent
        style={{ display: 'flex', flexDirection: 'column', padding: '5px' }}
      >
        <DialogContentText>
          Enter your yearly gross (pre-tax) income, your state, and your filing
          status.
        </DialogContentText>
        <TextField
          value={yearlyIncome}
          onChange={handleYearlyIncomeChange}
          placeholder="Enter your gross yearly income"
          fullWidth
          autoFocus
          margin="normal"
        />
        <RegionDropdown
          country="United States"
          value={selectedState}
          valueType="short"
          defaultOptionLabel="Select State"
          onChange={(val) => handleSelectedStateChange(val)}
          blacklist={{
            US: [
              'AS',
              'FM',
              'GU',
              'MH',
              'MP',
              'PW',
              'PR',
              'VI',
              'UM',
              'AA',
              'AE',
              'AP',
            ],
          }}
        />
        <select value={filingStatus} onChange={handleFilingStatusChange}>
          <option value="single">Single</option>
          <option value="married">Married</option>
          <option value="married_separately">Married Separately</option>
          <option value="head_of_household">Head of Household</option>
        </select>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNextDialogStep}
          disabled={!yearlyIncome || !selectedState}
        >
          Next
        </Button>
      </DialogActions>
    </Fragment>
  );

  if (activeStep === 1) {
    stepDisplayed = (
      <Fragment>
        <DialogContent
          style={{ display: 'flex', flexDirection: 'column', padding: '5px' }}
        >
          <DialogContentText>
            Enter your yearly 401k, IRA, and HSA contributions.
          </DialogContentText>
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
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="secondary"
            onClick={handlePreviousDialogStep}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNextDialogStep}
          >
            Next
          </Button>
        </DialogActions>
      </Fragment>
    );
  }

  if (activeStep === 2) {
    stepDisplayed = (
      <Fragment>
        <DialogContent>
          <DialogContentText>
            Enter your yearly fixed expenses (housing, utilities, debt payments,
            food, transportation, subscriptions, etc.)
          </DialogContentText>
          {inputList.map((expense, index) => {
            return (
              <div>
                <TextField
                  name="expenseName"
                  placeholder="Enter Expense Name"
                  value={expense.expenseName}
                  onChange={(event) => handleInputListChange(event, index)}
                  margin="normal"
                />
                <TextField
                  name="expenseCost"
                  placeholder="Enter Yearly Expense Cost"
                  value={expense.expenseCost}
                  onChange={(event) => handleInputListChange(event, index)}
                  margin="normal"
                />
                {inputList.length !== 1 && (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleRemoveClick(index)}
                  >
                    Remove
                  </Button>
                )}
                {inputList.length - 1 === index && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddClick}
                  >
                    Add
                  </Button>
                )}
              </div>
            );
          })}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="secondary"
            onClick={handlePreviousDialogStep}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={calculateTaxRates}
            disabled={!selectedState || !yearlyIncome}
          >
            Estimate Tax Rates and Potential Savings Rate
          </Button>
        </DialogActions>
      </Fragment>
    );
  }

  return (
    <Container>
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle>Enter Your Information</DialogTitle>
        {stepDisplayed}
      </Dialog>
      {!dialogOpen && taxData ? (
        <div style={{ paddingTop: '70px', textAlign: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDialogOpen}
          >
            Change Income, Contribution, or Expense Information
          </Button>
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              {/* <TableHead>
                <TableRow>
                  <TableCell>Thing</TableCell>
                  <TableCell align="right">#s</TableCell>
                </TableRow>
              </TableHead> */}
              <TableBody>
                <TableRow>
                  <TableCell component="th" scope="row">
                    Gross Yearly Income
                  </TableCell>
                  <TableCell align="right">
                    ${parseInt(yearlyIncome).toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    Federal
                  </TableCell>
                  <TableCell align="right">
                    ${federalTaxes.toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    FICA
                  </TableCell>
                  <TableCell align="right">${ficaTaxes.toFixed(2)}</TableCell>
                </TableRow>
                {stateTaxes ? (
                  <TableRow>
                    <TableCell component="th" scope="row">
                      State
                    </TableCell>
                    <TableCell align="right">
                      ${stateTaxes.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell component="th" scope="row">
                      No State Taxes in {selectedState}
                    </TableCell>
                    <TableCell align="right">$0</TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell component="th" scope="row">
                    Total Yearly Income Tax
                  </TableCell>
                  <TableCell align="right">${totalTaxes.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    Total Yearly Take Home
                  </TableCell>
                  <TableCell align="right">
                    ${totalTakeHome.toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    Total Yearly Retirement Contributions
                  </TableCell>
                  <TableCell align="right">
                    ${parseInt(totalContributions).toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    Effective Income Tax Rate
                  </TableCell>
                  <TableCell align="right">
                    {(totalTaxes / yearlyIncome).toFixed(2) * 100}%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    Yearly Fixed Expenses
                  </TableCell>
                  <TableCell align="right">
                    ${totalFixedExpenses.toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    Yearly Take Home After Fixed Expenses
                  </TableCell>
                  <TableCell align="right">
                    ${(totalTakeHome - totalFixedExpenses).toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    Max Potential Savings Rate of After Tax Income (Take Home -
                    Fixed Expense) Excluding Retirement Contributions
                  </TableCell>
                  <TableCell align="right">
                    {(
                      (totalTakeHome - totalFixedExpenses) /
                      totalTakeHome
                    ).toFixed(2) * 100}
                    %
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    Max Potential Savings Rate of After Tax Income (Take Home -
                    Fixed Expense) Including Retirement Contributions
                  </TableCell>
                  <TableCell align="right">
                    {(
                      (totalTakeHome -
                        totalFixedExpenses +
                        totalContributions) /
                      (totalTakeHome + totalContributions)
                    ).toFixed(2) * 100}
                    %
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      ) : loading ? (
        <LinearProgress style={{ marginTop: '100px' }} />
      ) : null}
    </Container>
  );
}

export default SavingsRateCalculator;
