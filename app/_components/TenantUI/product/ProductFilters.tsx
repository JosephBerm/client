'use client';

import { useState } from 'react';
import Button from '@_components/ui/Button';
import Input from '@_components/ui/Input';
import Select, { type SelectOption } from '@_components/ui/Select';
import Card from '@_components/ui/Card';

interface FilterField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'range';
  options?: string[];
}

interface ProductFiltersProps {
  filterFields?: FilterField[];
  onFilterChange?: (filters: Record<string, string>) => void;
}

/**
 * Product Filters Component
 *
 * Advanced filtering interface for product catalogs.
 * Supports text search, dropdowns, and range filters.
 * Uses DaisyUI semantic colors and existing UI components.
 *
 * TIER: Professional
 * CATEGORY: Product
 */
export default function ProductFilters({
  filterFields = [
    { name: 'search', label: 'Search', type: 'text' },
    { name: 'category', label: 'Category', type: 'select', options: ['All', 'Surgical', 'Diagnostic', 'Disposable'] },
    { name: 'priceRange', label: 'Price Range', type: 'range' },
  ],
  onFilterChange,
}: ProductFiltersProps) {
  const [filters, setFilters] = useState<Record<string, string>>({});

  const handleFilterChange = (name: string, value: string) => {
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);

    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
  };

  const handleReset = () => {
    setFilters({});
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  // Convert string options to SelectOption format
  const toSelectOptions = (options: string[]): SelectOption<string>[] =>
    options.map((opt) => ({ value: opt, label: opt }));

  return (
    <Card variant="elevated">
      <header className="border-b border-base-300 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-base-content">Filters</h2>
      </header>

      <div className="space-y-4 p-4 sm:p-6">
        {filterFields.map((field) => (
          <div key={field.name} className="form-control">
            <label htmlFor={field.name} className="label">
              <span className="label-text text-base-content">{field.label}</span>
            </label>

            {field.type === 'text' && (
              <Input
                id={field.name}
                name={field.name}
                type="text"
                placeholder={`Search by ${field.label.toLowerCase()}...`}
                value={filters[field.name] || ''}
                onChange={(e) => handleFilterChange(field.name, e.target.value)}
              />
            )}

            {field.type === 'select' && field.options && (
              <Select
                id={field.name}
                name={field.name}
                value={filters[field.name] || ''}
                onChange={(e) => handleFilterChange(field.name, e.target.value)}
                options={toSelectOptions(field.options)}
                placeholder={`Select ${field.label.toLowerCase()}`}
              />
            )}

            {field.type === 'range' && (
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters[`${field.name}Min`] || ''}
                  onChange={(e) => handleFilterChange(`${field.name}Min`, e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters[`${field.name}Max`] || ''}
                  onChange={(e) => handleFilterChange(`${field.name}Max`, e.target.value)}
                />
              </div>
            )}
          </div>
        ))}

        <Button variant="ghost" fullWidth onClick={handleReset}>
          Reset Filters
        </Button>
      </div>
    </Card>
  );
}
