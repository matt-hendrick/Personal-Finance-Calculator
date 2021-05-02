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
import TableContainer from '@material-ui/core/TableContainer';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

// Components
import MyTableRow from '../../components/MyTableRow/MyTableRow';

function SavingsRateCalculator() {
  const [yearlyIncome, setYearlyIncome] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [filingStatus, setFilingStatus] = useState('single');
  const [age, setAge] = useState('');
  const [taxData, setTaxData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [contribution401k, setContribution401k] = useState('');
  const [contributionIRA, setContributionIRA] = useState('');
  const [contributionHSA, setContributionHSA] = useState('');
  const [employerContribution401k, setEmployerContribution401k] = useState('');
  const [employerContributionHSA, setEmployerContributionHSA] = useState('');
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

  const handleAgeChange = (event) => {
    if (
      event.target.value === '' ||
      (numberRegex.test(event.target.value) &&
        parseInt(event.target.value) <= 120 &&
        parseInt(event.target.value) >= 0)
    ) {
      const updatedAge = event.target.value;
      setAge(updatedAge);
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
      if (parseInt(event.target.value) <= 26500 && age >= 50) {
        const updatedContribution401k = event.target.value;
        setContribution401k(updatedContribution401k);
      } else if (parseInt(event.target.value) <= 19500) {
        const updatedContribution401k = event.target.value;
        setContribution401k(updatedContribution401k);
      } else if (event.target.value === '') {
        const updatedContribution401k = event.target.value;
        setContribution401k(updatedContribution401k);
      }
    } else return;
  };

  const handleContributionIRAChange = (event) => {
    if (event.target.value === '' || numberRegex.test(event.target.value)) {
      if (parseInt(event.target.value) <= 7000 && age >= 50) {
        const updatedContributionIRA = event.target.value;
        setContributionIRA(updatedContributionIRA);
      } else if (parseInt(event.target.value) <= 6000) {
        const updatedContributionIRA = event.target.value;
        setContributionIRA(updatedContributionIRA);
      } else if (parseInt(event.target.value) === '') {
        const updatedContributionIRA = event.target.value;
        setContributionIRA(updatedContributionIRA);
      }
    } else return;
  };

  const handleContributionHSAChange = (event) => {
    if (
      event.target.value === '' ||
      (numberRegex.test(event.target.value) &&
        parseInt(event.target.value) <= 7100)
    ) {
      const updatedContributionHSA = event.target.value;
      setContributionHSA(updatedContributionHSA);
    } else return;
  };

  const handleEmployerContribution401kChange = (event) => {
    if (event.target.value === '' || numberRegex.test(event.target.value)) {
      const updatedEmployerContribution401k = event.target.value;
      setEmployerContribution401k(updatedEmployerContribution401k);
    } else return;
  };

  const handleEmployerContributionHSAChange = (event) => {
    if (event.target.value === '' || numberRegex.test(event.target.value)) {
      const updatedEmployerContributionHSA = event.target.value;
      setEmployerContributionHSA(updatedEmployerContributionHSA);
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
  if (employerContribution401k)
    totalContributions += parseInt(employerContribution401k);

  if (employerContributionHSA)
    totalContributions += parseInt(employerContributionHSA);

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
          'https://us-central1-personalfinancecalculator.cloudfunctions.net/app/TaxRates',
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
        <DialogTitle>
          Enter your yearly gross (pre-tax) income, your state, your filing
          status, and your age.
        </DialogTitle>
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
        <TextField
          value={age}
          onChange={handleAgeChange}
          placeholder="Enter your age"
          fullWidth
          autoFocus
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNextDialogStep}
          disabled={!yearlyIncome || !selectedState || !age}
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
          <DialogTitle>
            Enter your personal yearly 401k, IRA, and HSA contributions.
          </DialogTitle>
          <TextField
            value={contribution401k}
            onChange={handleContribution401kChange}
            placeholder="Enter your personal yearly 401k contribution"
          />
          <TextField
            value={contributionIRA}
            onChange={handleContributionIRAChange}
            placeholder="Enter your personal yearly IRA contribution"
          />
          <TextField
            value={contributionHSA}
            onChange={handleContributionHSAChange}
            placeholder="Enter your personal yearly HSA contribution"
          />
          <Container>
            <DialogContentText>
              If you are under 50 years old, the 401k yearly personal
              contribution cap is $19,500 and the IRA cap is $6,000.
            </DialogContentText>
            <DialogContentText>
              If you are over 50 years old, the 401k yearly personal
              contribution cap is $26,000 and the IRA cap is $7,000.
            </DialogContentText>
            <DialogContentText>
              Combined personal-employer HSA yearly contributions are limited to
              $3,550 (self-only) and $7,100 (family).
            </DialogContentText>
          </Container>
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
        <DialogContent
          style={{ display: 'flex', flexDirection: 'column', padding: '5px' }}
        >
          <DialogTitle>
            Enter your employer's yearly 401k, IRA, and HSA contributions.
          </DialogTitle>
          <TextField
            value={employerContribution401k}
            onChange={handleEmployerContribution401kChange}
            placeholder="Enter your employer's yearly 401k contribution"
          />

          <TextField
            value={employerContributionHSA}
            onChange={handleEmployerContributionHSAChange}
            placeholder="Enter your employer's yearly HSA contribution"
          />
          <Container>
            <DialogContentText>
              The maximum employer 401k contribution in 2020 is $37,500.
            </DialogContentText>

            <DialogContentText>
              Combined personal-employer HSA yearly contributions are limited to
              $3,550 (self-only) and $7,100 (family).
            </DialogContentText>
          </Container>
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

  if (activeStep === 3) {
    stepDisplayed = (
      <Fragment>
        <DialogContent>
          <DialogTitle>
            Enter your yearly fixed expenses (housing, utilities, debt payments,
            food, transportation, subscriptions, etc.)
          </DialogTitle>
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
        {stepDisplayed}
      </Dialog>
      {!dialogOpen ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '15px',
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleDialogOpen}
          >
            Change Income, Contribution, or Expense Information
          </Button>
        </div>
      ) : null}
      {!dialogOpen && taxData ? (
        <div style={{ paddingTop: '20px', textAlign: 'center' }}>
          <h4>
            Your Estimated Income, Taxes, Expenses, and Retirement Contributions
          </h4>
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Statistic</TableCell>
                  <TableCell
                    align="left"
                    style={{ borderLeft: '1px solid black' }}
                  >
                    Yearly
                  </TableCell>
                  <TableCell
                    align="left"
                    style={{ borderLeft: '1px solid black' }}
                  >
                    Monthly
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <MyTableRow
                  cellTitle="Gross Income"
                  primaryNumber={`$${parseInt(yearlyIncome).toFixed(2)}`}
                  secondaryNumber={`$${(parseInt(yearlyIncome) / 12).toFixed(
                    2
                  )}`}
                />
                <MyTableRow
                  cellTitle="Federal"
                  primaryNumber={`$${federalTaxes.toFixed(2)}`}
                  secondaryNumber={`$${(federalTaxes / 12).toFixed(2)}`}
                />
                <MyTableRow
                  cellTitle="FICA"
                  primaryNumber={`$${ficaTaxes.toFixed(2)}`}
                  secondaryNumber={`$${(ficaTaxes / 12).toFixed(2)}`}
                />
                {stateTaxes ? (
                  <MyTableRow
                    cellTitle="State"
                    primaryNumber={`$${stateTaxes.toFixed(2)}`}
                    secondaryNumber={`$${(stateTaxes / 12).toFixed(2)}`}
                  />
                ) : (
                  <MyTableRow
                    cellTitle={`No State Taxes in ${selectedState}`}
                    primaryNumber="$0"
                    secondaryNumber="$0"
                  />
                )}
                <MyTableRow
                  cellTitle="Total Income Tax"
                  primaryNumber={`$${totalTaxes.toFixed(2)}`}
                  secondaryNumber={`$${(totalTaxes / 12).toFixed(2)}`}
                />
                <MyTableRow
                  cellTitle="Total Take Home (Pre-Fixed Expenses)"
                  primaryNumber={`$${totalTakeHome.toFixed(2)}`}
                  secondaryNumber={`$${(totalTakeHome / 12).toFixed(2)}`}
                />
                <MyTableRow
                  cellTitle="Total Retirement Contributions"
                  primaryNumber={`$${parseInt(totalContributions).toFixed(2)}`}
                  secondaryNumber={`$${(
                    parseInt(totalContributions) / 12
                  ).toFixed(2)}`}
                />
                <MyTableRow
                  cellTitle="Take Home (Pre-Fixed Expenses) plus Retirement Contributions"
                  primaryNumber={`$${(
                    totalTakeHome + totalContributions
                  ).toFixed(2)}`}
                  secondaryNumber={`$${(
                    (totalTakeHome + totalContributions) /
                    12
                  ).toFixed(2)}`}
                />
                <MyTableRow
                  cellTitle="Fixed Expenses"
                  primaryNumber={`$${totalFixedExpenses.toFixed(2)}`}
                  secondaryNumber={`$${(totalFixedExpenses / 12).toFixed(2)}`}
                />
                <MyTableRow
                  cellTitle="Take Home After
                  Fixed Expenses (Excluding Retirement Contributions) "
                  primaryNumber={`$${(
                    totalTakeHome - totalFixedExpenses
                  ).toFixed(2)}`}
                  secondaryNumber={`$${(
                    (totalTakeHome - totalFixedExpenses) /
                    12
                  ).toFixed(2)}`}
                />
                <MyTableRow
                  cellTitle="Take Home After
                  Fixed Expenses (Including Retirement Contributions) "
                  primaryNumber={`$${(
                    totalTakeHome -
                    totalFixedExpenses +
                    totalContributions
                  ).toFixed(2)}`}
                  secondaryNumber={`$${(
                    (totalTakeHome - totalFixedExpenses + totalContributions) /
                    12
                  ).toFixed(2)}`}
                />
              </TableBody>
            </Table>
          </TableContainer>
          <h4>Percentages</h4>
          <TableContainer>
            <Table>
              <MyTableRow
                cellTitle="Effective Income Tax Rate"
                primaryNumber={`${((totalTaxes / yearlyIncome) * 100).toFixed(
                  2
                )}%`}
              />
              <MyTableRow
                cellTitle="Max Potential Savings Rate After Taxes and Fixed Expenses (Excluding Retirement Contributions)"
                primaryNumber={`${(
                  ((totalTakeHome - totalFixedExpenses) / totalTakeHome) *
                  100
                ).toFixed(2)}
                  %`}
              />
              <MyTableRow
                cellTitle="Max Potential Savings Rate After Taxes and Fixed Expenses (Including Retirement Contributions)"
                primaryNumber={`${(
                  ((totalTakeHome - totalFixedExpenses + totalContributions) /
                    (totalTakeHome + totalContributions)) *
                  100
                ).toFixed(2)}
                  %`}
              />
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
