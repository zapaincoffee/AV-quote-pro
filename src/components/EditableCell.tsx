'use client';

import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import { CellContext } from '@tanstack/react-table';

// The props are now the same as the CellContext
const EditableCell = ({
  getValue,
  row: { index },
  column: { id, columnDef },
  table: { meta },
}: CellContext<any, any>) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  const type = (columnDef.meta as any)?.type || 'text'; // Get type from column meta

  const onBlur = () => {
    meta?.updateData(index, id, value);
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <TextField
      value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={onBlur}
      variant="standard"
      type={type}
      fullWidth
      sx={{
        '& .MuiInput-underline:before': { borderBottom: 'none' },
        '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
        '& .MuiInput-underline:after': { borderBottom: 'none' },
        padding: '4px 8px',
      }}
    />
  );
};

export default EditableCell;
