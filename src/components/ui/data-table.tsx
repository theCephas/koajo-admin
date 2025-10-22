/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { Search, Filter, RotateCw } from "lucide-react";
import { Pagination } from "./pagination";

// Add (or ensure) Column type is exported so pages can strongly type columns
export interface Column<T> {
  key: keyof T | string;
  label: string;
  width?: number | string;
  className?: string;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  download?: boolean;
  onRowSelect?: (selectedIds: (string | number)[]) => void;
  selectedRows?: (string | number)[];
  showCheckboxes?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  searchPlaceholder?: string;
  filterOptions?: FilterOption[];
  filterKey?: keyof T | string;
  filterLabel?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;

  // Pagination (server-ready)
  page?: number; // 1-based
  pageSize?: number;
  totalCount?: number; // pass to use server totals; if absent, uses filtered length
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];

  onRefresh?: () => void;
  loading?: boolean;

  className?: string;
  toolbarRight?: React.ReactNode; // NEW: custom right content in the toolbar
}

/**
 * Reusable DataTable Component with TypeScript support
 *
 * @template T - The type of data objects in the table
 */
const DataTable = <T extends { id: string | number }>({
  data = [],
  title = "",
  columns = [],
  onRowSelect = () => {},
  selectedRows = [],
  showCheckboxes = true,
  searchable = true,
  filterable = false,
  searchPlaceholder = "Search...",
  filterOptions = [],
  filterKey,
  filterLabel = "Filter",
  emptyStateTitle = "No results found",
  emptyStateDescription = "No data available",
  // pagination props
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  onRefresh,
  loading = false,
  className = "",
  toolbarRight,
}: DataTableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterValue, setFilterValue] = useState<string>("All");

  // internal state if uncontrolled
  const [innerPage, setInnerPage] = useState<number>(1);
  const [innerPageSize, setInnerPageSize] = useState<number>(10);

  const currentPage = page ?? innerPage;
  const currentPageSize = Math.min(pageSize ?? innerPageSize, 100);

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    if (page == null) setInnerPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterValue]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        Object.values(item as Record<string, any>).some((value) => {
          if (typeof value === "object" && value !== null) {
            return Object.values(value).some((nestedValue) =>
              String(nestedValue)
                .toLowerCase()
                .includes(searchTerm.toLowerCase()),
            );
          }
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });

      const matchesFilter =
        !filterable ||
        filterValue === "All" ||
        !filterKey ||
        (item as any)[filterKey] === filterValue;

      return matchesSearch && matchesFilter;
    });
  }, [data, filterValue, filterKey, filterable, searchTerm]);

  // total used for footer and page count (server or client)
  const effectiveTotal = totalCount ?? filteredData.length;
  const totalPages = Math.max(1, Math.ceil(effectiveTotal / currentPageSize));
  const clampedPage = Math.min(Math.max(1, currentPage), totalPages);

  // Client-side page slicing when totalCount not provided
  const pageSlice = useMemo(() => {
    if (totalCount != null) return data; // assume server provided page data
    const start = (clampedPage - 1) * currentPageSize;
    const end = start + currentPageSize;
    return filteredData.slice(start, end);
  }, [clampedPage, currentPageSize, data, filteredData, totalCount]);

  // Selection only for visible rows
  const visibleIds = useMemo(() => pageSlice.map((r) => r.id), [pageSlice]);
  const isAllSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedRows.includes(id));
  const isIndeterminate =
    selectedRows.length > 0 &&
    visibleIds.some((id) => selectedRows.includes(id)) &&
    !isAllSelected;

  const getNestedValue = (obj: any, key: string): any =>
    key.split(".").reduce((value, k) => value?.[k], obj);

  const showingFrom =
    effectiveTotal === 0 ? 0 : (clampedPage - 1) * currentPageSize + 1;
  const showingTo = Math.min(clampedPage * currentPageSize, effectiveTotal);

  const handleChangePage = (p: number) => {
    if (onPageChange) onPageChange(p);
    else setInnerPage(p);
  };
  const handleChangePageSize = (s: number) => {
    const size = Math.min(s, 100);
    if (onPageSizeChange) onPageSizeChange(size);
    else setInnerPageSize(size);
    // reset page to 1 when page size changes
    if (onPageChange) onPageChange(1);
    else setInnerPage(1);
  };

  return (
    <div
      className={`bg-white space-y-4 rounded-2xl border border-gray-200 overflow-hidden shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pt-4 px-4">
        <div className="flex items-center gap-3">
          {title && (
            <h1 className="text-[#111827] text-[17px] md:text-[23.25px] font-bold">
              {title}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="cursor-pointer border border-[#E2E8F0] rounded-[8px] h-[36px] px-3 inline-flex items-center gap-2 text-sm hover:bg-gray-50 disabled:opacity-60"
          >
            <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {(searchable || filterable) && (
        <div className="px-4 pb-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          {/* Left: search + (optional) filter select */}
          <div className="flex items-center gap-4 flex-1">
            {searchable && (
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}

            {filterable && filterOptions.length > 0 && (
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent bg-white"
                  aria-label={filterLabel}
                >
                  {filterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Right: custom actions slot */}
          <div className="flex items-center gap-2">{toolbarRight}</div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {showCheckboxes && (
                <th className="px-6 py-3 text-left w-12">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = isIndeterminate;
                      }}
                      onClick={(e) => e.stopPropagation()} // avoid parent click conflicts
                      onChange={(e) => {
                        const checked = e.target.checked;
                        if (checked)
                          onRowSelect([
                            ...new Set([...selectedRows, ...visibleIds]),
                          ]);
                        else
                          onRowSelect(
                            selectedRows.filter(
                              (id) => !visibleIds.includes(id),
                            ),
                          );
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-[#FF8C42] focus:ring-[#FF8C42] focus:ring-2 cursor-pointer"
                      aria-label="Select all rows on page"
                    />
                  </div>
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pageSlice.map((row, index) => (
              <tr
                key={row.id}
                className={`hover:bg-gray-50 transition-colors ${
                  selectedRows.includes(row.id) ? "bg-blue-50" : ""
                } ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
              >
                {showCheckboxes && (
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onClick={(e) => e.stopPropagation()} // prevent any row-level handlers
                        onChange={(e) =>
                          onRowSelect(
                            e.target.checked
                              ? [...selectedRows, row.id]
                              : selectedRows.filter((id) => id !== row.id),
                          )
                        }
                        className="w-4 h-4 rounded border-gray-300 text-[#FF8C42] focus:ring-[#FF8C42] focus:ring-2 cursor-pointer"
                        aria-label={`Select row ${row.id}`}
                      />
                    </div>
                  </td>
                )}
                {columns.map((column) => {
                  const value = getNestedValue(row, String(column.key));
                  return (
                    <td
                      key={String(column.key)}
                      className="px-6 py-4 whitespace-nowrap"
                    >
                      <div className={column.className ?? ""}>
                        {column.render ? column.render(value, row) : value}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {(totalCount == null ? filteredData.length === 0 : data.length === 0) && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <Search className="w-12 h-12 mx-auto mb-4" />
          </div>
          <div className="text-lg font-medium text-gray-900 mb-1">
            {emptyStateTitle}
          </div>
          <div className="text-gray-500">
            {searchTerm
              ? `No results match "${searchTerm}"`
              : emptyStateDescription}
          </div>
        </div>
      )}

      {/* Footer with page size + label + pagination */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={currentPageSize}
                onChange={(e) => handleChangePageSize(Number(e.target.value))}
                className="appearance-none rounded-xl border bg-white px-3 py-1.5 text-sm pr-7"
                disabled={loading}
                aria-label="Rows per page"
              >
                {pageSizeOptions
                  .filter((n) => n <= 100)
                  .map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                ▾
              </span>
            </div>

            <span className="text-sm text-gray-500">
              Showing {showingFrom} - {showingTo} of {effectiveTotal}
            </span>
          </div>

          <Pagination
            page={clampedPage}
            totalPages={totalPages}
            onPageChange={handleChangePage}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default DataTable;
