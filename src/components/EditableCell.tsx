'use client';

import { useState, useEffect } from 'react';
import { TableMeta } from '@tanstack/react-table';
import TextField from '@mui/material/TextField';

interface EditableCellProps {
  getValue: () => any;
  row: { index: number };
  column: { id: string };
  table: {
    meta?: {
      updateData: (rowIndex: number, columnId: string, value: any) => void;
      type?: string;
    };
  };
}

const EditableCell = ({ getValue, row, column, table }: EditableCellProps) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  const type = table.meta?.type || 'text';

  const onBlur = () => {
    table.meta?.updateData(row.index, column.id, value);
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
        padding: '4px 8px', // Add some padding
      }}
    />
  );
};

export default EditableCell;
