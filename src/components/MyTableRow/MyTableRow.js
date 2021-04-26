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
        {props.primaryNumber}
      </TableCell>
      {props.secondaryNumber ? (
        <TableCell align="left" style={{ borderLeft: '1px solid black' }}>
          {props.secondaryNumber}
        </TableCell>
      ) : null}
    </TableRow>
  );
}

export default MyTableRow;
