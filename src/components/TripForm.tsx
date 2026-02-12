import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import type { TripRequest } from '@/lib/types';

interface TripFormProps {
  onSubmit: (data: TripRequest) => void;
  isLoading: boolean;
}

export function TripForm({ onSubmit, isLoading }: TripFormProps) {
  const [form, setForm] = useState<TripRequest>({
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    cycle_used_hours: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.current_location.trim()) e.current_location = 'Current location is required';
    if (!form.pickup_location.trim()) e.pickup_location = 'Pickup location is required';
    if (!form.dropoff_location.trim()) e.dropoff_location = 'Drop-off location is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onSubmit(form);
  }

  function update(field: keyof TripRequest, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  return (
    <form onSubmit={handleSubmit} className="trip-form">
      <div className="form-logo">
        <div className="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <h1 className="logo-text">SpotterAI</h1>
        <p className="logo-subtitle">Trip Planner & ELD Generator</p>
      </div>

      <Card className="form-card">
        <CardContent className="form-card-content">
          <div className="form-section">
            <div className="section-label">
              <span className="section-dot section-dot--current" />
              Route Locations
            </div>

            <div className="form-field">
              <Label htmlFor="current_location" className="form-label">Current Location</Label>
              <Input
                id="current_location"
                placeholder="e.g. San Francisco, CA"
                value={form.current_location}
                onChange={(e) => update('current_location', e.target.value)}
                className={`form-input ${errors.current_location ? 'form-input--error' : ''}`}
              />
              {errors.current_location && <span className="form-error">{errors.current_location}</span>}
            </div>

            <div className="form-field">
              <Label htmlFor="pickup_location" className="form-label">Pickup Location</Label>
              <Input
                id="pickup_location"
                placeholder="e.g. Los Angeles, CA"
                value={form.pickup_location}
                onChange={(e) => update('pickup_location', e.target.value)}
                className={`form-input ${errors.pickup_location ? 'form-input--error' : ''}`}
              />
              {errors.pickup_location && <span className="form-error">{errors.pickup_location}</span>}
            </div>

            <div className="form-field">
              <Label htmlFor="dropoff_location" className="form-label">Drop-off Location</Label>
              <Input
                id="dropoff_location"
                placeholder="e.g. New York, NY"
                value={form.dropoff_location}
                onChange={(e) => update('dropoff_location', e.target.value)}
                className={`form-input ${errors.dropoff_location ? 'form-input--error' : ''}`}
              />
              {errors.dropoff_location && <span className="form-error">{errors.dropoff_location}</span>}
            </div>
          </div>

          <div className="form-section">
            <div className="section-label">
              <span className="section-dot section-dot--hours" />
              HOS Cycle
            </div>

            <div className="form-field">
              <div className="slider-header">
                <Label className="form-label">Cycle Hours Used</Label>
                <span className="slider-value">{form.cycle_used_hours}h <span className="slider-max">/ 70h</span></span>
              </div>
              <Slider
                value={[form.cycle_used_hours]}
                onValueChange={([v]) => update('cycle_used_hours', v)}
                min={0}
                max={70}
                step={0.5}
                className="form-slider"
              />
              <div className="slider-labels">
                <span>Fresh start</span>
                <span>Max cycle</span>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="submit-btn"
          >
            {isLoading ? (
              <span className="btn-loading">
                <span className="btn-spinner" />
                Computing Route...
              </span>
            ) : (
              <span className="btn-content">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-icon">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                Plan Trip
              </span>
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
