import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { analyticsAPI } from '../../../utils/analytics-api';

const DataTable = ({ onExportData }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [mockData, setMockData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentPage, itemsPerPage, sortField, sortDirection, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await analyticsAPI.getData({
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
        sort_field: sortField,
        sort_direction: sortDirection,
        search: searchQuery
      });
      setMockData(response.data.data.records || []);
      setTotal(response.data.data.total || 0);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fallbackMockData = [
    {
      id: 1,
      timestamp: '2025-10-07 14:30:00',
      location: 'Downtown District',
      pm25: 78,
      pm10: 95,
      no2: 65,
      so2: 28,
      co: 1.4,
      o3: 45,
      temperature: 25.2,
      humidity: 58,
      source: 'IoT Sensor',
      status: 'Normal'
    },
    {
      id: 2,
      timestamp: '2025-10-07 14:25:00',
      location: 'River Park',
      pm25: 45,
      pm10: 62,
      no2: 38,
      so2: 12,
      co: 0.8,
      o3: 85,
      temperature: 22.8,
      humidity: 65,
      source: 'Government Station',
      status: 'Good'
    },
    {
      id: 3,
      timestamp: '2025-10-07 14:20:00',
      location: 'Industrial Zone',
      pm25: 142,
      pm10: 185,
      no2: 95,
      so2: 48,
      co: 2.3,
      o3: 28,
      temperature: 28.5,
      humidity: 45,
      source: 'Satellite Data',
      status: 'Unhealthy'
    },
    {
      id: 4,
      timestamp: '2025-10-07 14:15:00',
      location: 'Residential North',
      pm25: 52,
      pm10: 68,
      no2: 42,
      so2: 15,
      co: 0.9,
      o3: 78,
      temperature: 24.1,
      humidity: 62,
      source: 'Citizen Report',
      status: 'Moderate'
    },
    {
      id: 5,
      timestamp: '2025-10-07 14:10:00',
      location: 'Harbor District',
      pm25: 68,
      pm10: 84,
      no2: 55,
      so2: 22,
      co: 1.2,
      o3: 58,
      temperature: 26.3,
      humidity: 55,
      source: 'IoT Sensor',
      status: 'Moderate'
    }
  ];

  const columns = [
    { key: 'timestamp', label: 'Timestamp', sortable: true },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'pm25', label: 'PM2.5', sortable: true, unit: 'μg/m³' },
    { key: 'pm10', label: 'PM10', sortable: true, unit: 'μg/m³' },
    { key: 'no2', label: 'NO2', sortable: true, unit: 'ppb' },
    { key: 'so2', label: 'SO2', sortable: true, unit: 'ppb' },
    { key: 'co', label: 'CO', sortable: true, unit: 'ppm' },
    { key: 'o3', label: 'O3', sortable: true, unit: 'ppb' },
    { key: 'temperature', label: 'Temp', sortable: true, unit: '°C' },
    { key: 'humidity', label: 'Humidity', sortable: true, unit: '%' },
    { key: 'source', label: 'Source', sortable: true },
    { key: 'status', label: 'Status', sortable: true }
  ];

  const itemsPerPageOptions = [
    { value: 10, label: '10 per page' },
    { value: 25, label: '25 per page' },
    { value: 50, label: '50 per page' },
    { value: 100, label: '100 per page' }
  ];

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleRowSelect = (id) => {
    setSelectedRows(prev =>
      prev?.includes(id)
        ? prev?.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows?.length === mockData?.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(mockData?.map(row => row?.id));
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'good':
        return 'text-success bg-success/10';
      case 'moderate':
        return 'text-warning bg-warning/10';
      case 'unhealthy':
        return 'text-error bg-error/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const filteredData = mockData?.filter(row =>
    Object.values(row)?.some(value =>
      value?.toString()?.toLowerCase()?.includes(searchQuery?.toLowerCase())
    )
  );

  const sortedData = [...filteredData]?.sort((a, b) => {
    const aValue = a?.[sortField];
    const bValue = b?.[sortField];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    const aStr = aValue?.toString()?.toLowerCase();
    const bStr = bValue?.toString()?.toLowerCase();
    
    if (sortDirection === 'asc') {
      return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
    } else {
      return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
    }
  });

  const totalPages = Math.ceil(sortedData?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData?.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Table Header */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Environmental Data Table</h3>
            <p className="text-sm text-muted-foreground">
              {filteredData?.length} records • {selectedRows?.length} selected
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex-1 min-w-64">
              <Input
                type="search"
                placeholder="Search data..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value)}
              />
            </div>

            <Select
              options={itemsPerPageOptions}
              value={itemsPerPage}
              onChange={setItemsPerPage}
              className="min-w-32"
            />

            <Button
              variant="outline"
              iconName="Download"
              iconPosition="left"
              onClick={onExportData}
              disabled={selectedRows?.length === 0}
            >
              Export Selected
            </Button>
          </div>
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows?.length === mockData?.length}
                  onChange={handleSelectAll}
                  className="rounded border-border"
                />
              </th>
              {columns?.map((column) => (
                <th
                  key={column?.key}
                  className="p-3 text-left text-sm font-medium text-foreground"
                >
                  {column?.sortable ? (
                    <button
                      onClick={() => handleSort(column?.key)}
                      className="flex items-center space-x-1 hover:text-primary transition-colors"
                    >
                      <span>{column?.label}</span>
                      {sortField === column?.key && (
                        <Icon
                          name={sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown'}
                          size={14}
                        />
                      )}
                    </button>
                  ) : (
                    column?.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData?.map((row) => (
              <tr
                key={row?.id}
                className={`border-t border-border hover:bg-muted/30 transition-colors ${
                  selectedRows?.includes(row?.id) ? 'bg-muted/50' : ''
                }`}
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedRows?.includes(row?.id)}
                    onChange={() => handleRowSelect(row?.id)}
                    className="rounded border-border"
                  />
                </td>
                {columns?.map((column) => (
                  <td key={column?.key} className="p-3 text-sm">
                    {column?.key === 'status' ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row?.[column?.key])}`}>
                        {row?.[column?.key]}
                      </span>
                    ) : column?.key === 'timestamp' ? (
                      <div className="font-mono text-xs">{row?.[column?.key]}</div>
                    ) : (
                      <div>
                        {row?.[column?.key]}
                        {column?.unit && <span className="text-muted-foreground ml-1">{column?.unit}</span>}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData?.length)} of {filteredData?.length} results
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <Icon name="ChevronLeft" size={16} />
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8"
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <Icon name="ChevronRight" size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;