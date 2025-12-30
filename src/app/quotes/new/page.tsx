'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  RowData,
} from '@tanstack/react-table';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import EditableCell from '@/components/EditableCell'; // Import the new component

// --- Data Structures ---
declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  }
  interface ColumnMeta<TData extends RowData, TValue> {
    type?: string;
  }
}

type QuoteItem = {
  itemNumber: string;
  name: string;
  quantity: number;
  days: number;
  pricePerDay: number;
  total: number;
  note?: string;
};

type QuoteSection = {
  id: string;
  name: string;
  items: QuoteItem[];
};

// --- Column Definitions ---
const columnHelper = createColumnHelper<QuoteItem>();
const columns = [
  columnHelper.accessor('itemNumber', { cell: info => info.getValue(), header: () => <span>#</span>, size: 20 }),
  columnHelper.accessor('name', { cell: (props) => <EditableCell {...props} />, header: () => <span>Item Name</span>, size: 300 }),
  columnHelper.accessor('quantity', { cell: (props) => <EditableCell {...props} />, header: () => <span>Qty</span>, size: 50, meta: { type: 'number' } }),
  columnHelper.accessor('days', { cell: (props) => <EditableCell {...props} />, header: () => <span>Days</span>, size: 50, meta: { type: 'number' } }),
  columnHelper.accessor('pricePerDay', { cell: (props) => <EditableCell {...props} />, header: () => <span>Price/Day</span>, size: 80, meta: { type: 'number' } }),
  columnHelper.accessor('total', { cell: info => `$${info.getValue().toFixed(2)}`, header: () => <span>Total</span>, size: 100 }),
  columnHelper.accessor('note', { cell: (props) => <EditableCell {...props} />, header: () => <span>Note</span> }),
];


// --- Section Table Component ---
const SectionTable = ({ sectionData, onSectionUpdate }: { sectionData: QuoteSection, onSectionUpdate: (sectionId: string, items: QuoteItem[]) => void }) => {
  const table = useReactTable({
    data: sectionData.items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: (rowIndex, columnId, value) => {
        const newItems = sectionData.items.map((row, index) => {
          if (index === rowIndex) {
            const updatedRow = {
              ...sectionData.items[rowIndex]!,
              [columnId]: value,
            };
            // Recalculate total for the row
            const qty = Number(updatedRow.quantity) || 0;
            const days = Number(updatedRow.days) || 0;
            const price = Number(updatedRow.pricePerDay) || 0;
            updatedRow.total = qty * days * price; // Simple multiplication for now
            return updatedRow;
          }
          return row;
        });
        onSectionUpdate(sectionData.id, newItems);
      },
    },
  });

  return (
    <Table stickyHeader size="small">
      <TableHead>
        {table.getHeaderGroups().map(headerGroup => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <TableCell key={header.id} sx={{ width: header.getSize(), fontWeight: 'bold' }}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableHead>
      <TableBody>
        {table.getRowModel().rows.map(row => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map(cell => (
              <TableCell key={cell.id} sx={{ width: cell.column.getSize(), p: 0 }}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};


// --- Main Component ---
export default function NewQuotePage() {
  const router = useRouter();
  const [grandTotal, setGrandTotal] = useState(0);
  const [sections, setSections] = useState<QuoteSection[]>([
    { id: '1', name: 'Video', items: [
      { itemNumber: '1.1', name: 'Projector 5K', quantity: 1, days: 2, pricePerDay: 250, total: 500, note: ''},
    ]},
    { id: '2', name: 'Audio', items: [
      { itemNumber: '2.1', name: 'Shure SM58', quantity: 4, days: 2, pricePerDay: 10, total: 80, note: ''},
      { itemNumber: '2.2', name: 'Soundcraft Mixer', quantity: 1, days: 2, pricePerDay: 50, total: 100, note: ''},
    ]}
  ]);

  // Recalculate grand total whenever sections change
  useEffect(() => {
    const total = sections.reduce((total, section) => {
      return total + section.items.reduce((sectionTotal, item) => sectionTotal + item.total, 0);
    }, 0);
    setGrandTotal(total);
  }, [sections]);

  const addSection = () => {
    const newSectionName = `New Section ${sections.length + 1}`;
    setSections(prev => [...prev, { id: Date.now().toString(), name: newSectionName, items: [] }]);
  };

  const removeSection = (sectionId: string) => {
    setSections(prev => prev.filter(s => s.id !== sectionId));
  };
  
  const updateSectionItems = (sectionId: string, updatedItems: QuoteItem[]) => {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, items: updatedItems } : s));
  };

  return (
    <Box sx={{ my: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => router.back()} sx={{ mr: 1 }}><ArrowBackIcon /></IconButton>
        <Typography variant="h4" component="h1">Create New Quote</Typography>
      </Box>

      {/* Event Details Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Event Details</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
          <TextField label="Event Name" variant="outlined" required />
          <TextField label="Client Name" variant="outlined" required />
          <TextField label="Prep Date" type="date" variant="outlined" InputLabelProps={{ shrink: true }} />
          <TextField label="Start Date" type="date" variant="outlined" InputLabelProps={{ shrink: true }} required />
          <TextField label="End Date" type="date" variant="outlined" InputLabelProps={{ shrink: true }} required />
        </Box>
      </Paper>

      {/* Sections */}
      {sections.map((section) => (
        <Paper key={section.id} elevation={2} sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>{section.name}</Typography>
                <IconButton size="small" onClick={() => {}}><AddIcon /></IconButton>
                <IconButton size="small" color="error" onClick={() => removeSection(section.id)}><DeleteIcon /></IconButton>
            </Box>
            <SectionTable sectionData={section} onSectionUpdate={updateSectionItems} />
        </Paper>
      ))}

      <Button onClick={addSection} variant="outlined" sx={{ mb: 4 }}>Add Section</Button>

      {/* Grand Total */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Typography variant="h5">Grand Total: ${grandTotal.toFixed(2)}</Typography>
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="outlined" color="secondary" onClick={() => router.back()}>Cancel</Button>
        <Button variant="contained" color="primary">Save Quote</Button>
      </Box>
    </Box>
  );
}

