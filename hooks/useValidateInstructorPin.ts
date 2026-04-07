// Hook for live validation of instructor PIN during student signup
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ValidationResult {
  isValid: boolean;
  instructorId: string | null;
  instructorName: string | null;
  isValidating: boolean;
}

export function useValidateInstructorPin(pinCode: string): ValidationResult {
  const [result, setResult] = useState<ValidationResult>({
    isValid: false,
    instructorId: null,
    instructorName: null,
    isValidating: false,
  });

  useEffect(() => {
    // Only validate when we have a 4-digit PIN
    if (pinCode.length !== 4) {
      setResult({
        isValid: false,
        instructorId: null,
        instructorName: null,
        isValidating: false,
      });
      return;
    }

    const validatePin = async () => {
      setResult(prev => ({ ...prev, isValidating: true }));
      
      try {
        const { data, error } = await supabase
          .rpc('validate_permanent_instructor_pin', { _pin_code: pinCode });

        if (error) {
          console.error('PIN validation error:', error);
          setResult({
            isValid: false,
            instructorId: null,
            instructorName: null,
            isValidating: false,
          });
          return;
        }

        if (data && data.length > 0 && data[0].is_valid) {
          setResult({
            isValid: true,
            instructorId: data[0].instructor_id,
            instructorName: data[0].instructor_name,
            isValidating: false,
          });
        } else {
          setResult({
            isValid: false,
            instructorId: null,
            instructorName: null,
            isValidating: false,
          });
        }
      } catch (err) {
        console.error('PIN validation error:', err);
        setResult({
          isValid: false,
          instructorId: null,
          instructorName: null,
          isValidating: false,
        });
      }
    };

    // Debounce validation
    const timeout = setTimeout(validatePin, 300);
    return () => clearTimeout(timeout);
  }, [pinCode]);

  return result;
}
