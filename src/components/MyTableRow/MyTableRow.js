import React from 'react';

// MUI
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

function MyTableRow(props) {
  return (
    <TableRow>
      <TableCell component="th" scope="row">
        {props.cellTitle}
      </TableCell>
      <TableCell align="left" style={{ borderLeft: '1px solid black' }}>
        {props.baseYearlyNumber}
      </TableCell>
      {/* {props.monthlyNumber ? (
        <TableCell align="left" style={{ borderLeft: '1px solid black' }}>
          {props.monthlyNumber}
        </TableCell>
      ) : null} */}
      {props.minYearlyNumber ? (
        <TableCell align="left" style={{ borderLeft: '1px solid black' }}>
          {props.minYearlyNumber}{' '}
          {props.minNegative ? (
            <span style={{ color: 'red' }}>({props.minNegative})</span>
          ) : null}
          {props.minPositive ? (
            <span style={{ color: 'green' }}>({props.minPositive})</span>
          ) : null}
        </TableCell>
      ) : null}
    </TableRow>
  );
}

export default MyTableRow;
