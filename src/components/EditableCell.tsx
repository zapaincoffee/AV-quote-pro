'use client';

import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import { CellContext } from '@tanstack/react-table';

const EditableCell = ({
  getValue,
  row: { index },
  column: { id, columnDef },
  table,
}: CellContext<any, any>) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  
  // Bypass the type error by accessing meta directly and checking for existence.
  const updateData = (table.meta as any)?.updateData;
  const type = (columnDef.meta as any)?.type || 'text';

  const onBlur = () => {
    if (updateData) {
      updateData(index, id, value);
    }
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
