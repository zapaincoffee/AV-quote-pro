/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends import('@tanstack/react-table').RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  }
  interface ColumnMeta<TData extends import('@tanstack/react-table').RowData, TValue> {
    type?: string;
  }
}
