'use client';

import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import { CellContext } from '@tanstack/react-table';

// Define the shape of our custom meta object
interface CustomTableMeta {
  updateData: (rowIndex: number, columnId: string, value: any) => void;
}

const EditableCell = ({
  getValue,
  row: { index },
  column: { id, columnDef },
  table,
}: CellContext<any, any>) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  
  // Explicitly cast the table's meta object
  const customMeta = table.meta as CustomTableMeta;
  const type = (columnDef.meta as any)?.type || 'text';

  const onBlur = () => {
    customMeta?.updateData(index, id, value);
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
