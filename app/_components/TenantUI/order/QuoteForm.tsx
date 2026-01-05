'use client';

import { useState } from 'react';
import Card from '@_components/ui/Card';
import Button from '@_components/ui/Button';
import Input from '@_components/ui/Input';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea';
  required?: boolean;
}

interface QuoteFormProps {
  fields?: FormField[];
  onSubmit?: (data: Record<string, any>) => void;
}

/**
 * Quote Form Component
 *
 * Form for requesting product quotes.
 * Uses DaisyUI form styling and semantic colors.
 *
 * TIER: Trial (available to all tiers)
 * CATEGORY: Order
 */
export default function QuoteForm({
  fields = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', type: 'tel', required: false },
    { name: 'products', label: 'Products Needed', type: 'textarea', required: true },
    { name: 'message', label: 'Additional Information', type: 'textarea', required: false },
  ],
  onSubmit,
}: QuoteFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      // Reset form on success
      setFormData({});
    } catch (error) {
      console.error('Quote submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card variant="elevated" className="mx-auto max-w-2xl">
      <header className="space-y-2 p-6 pb-0">
        <h2 className="text-xl font-semibold text-base-content">Request a Quote</h2>
        <p className="text-sm text-base-content/70">
          Fill out the form below and we&apos;ll get back to you shortly
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        {fields.map((field) => (
          <div key={field.name} className="form-control">
            <label htmlFor={field.name} className="label">
              <span className="label-text text-base-content">
                {field.label}
                {field.required && <span className="text-error"> *</span>}
              </span>
            </label>

            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                rows={4}
                className="textarea textarea-bordered w-full bg-base-100 text-base-content"
              />
            ) : (
              <Input
                id={field.name}
                name={field.name}
                type={field.type}
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
              />
            )}
          </div>
        ))}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Quote Request'}
        </Button>
      </form>
    </Card>
  );
}
