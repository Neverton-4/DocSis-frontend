import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BaseFieldProps {
  label: string;
  id: string;
  error?: string;
  success?: boolean;
  required?: boolean;
  className?: string;
}

interface InputFieldProps extends BaseFieldProps {
  type?: 'input';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  inputType?: string;
  disabled?: boolean;
}

interface SelectFieldProps extends BaseFieldProps {
  type: 'select';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
}

type FormFieldProps = InputFieldProps | SelectFieldProps;

export const FormField: React.FC<FormFieldProps> = (props) => {
  const { label, id, error, success, required, className } = props;
  
  const getStatusIcon = () => {
    if (error) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    if (success) {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
    return null;
  };

  const getInputClassName = () => {
    return cn(
      "transition-colors duration-200",
      error && "border-red-500 focus:border-red-500 focus:ring-red-500",
      success && "border-green-500 focus:border-green-500 focus:ring-green-500",
      className
    );
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className={cn(required && "after:content-['*'] after:text-red-500 after:ml-1")}>
          {label}
        </Label>
        {getStatusIcon()}
      </div>
      
      {props.type === 'select' ? (
        <Select 
          value={props.value} 
          onValueChange={props.onChange}
          disabled={props.disabled}
        >
          <SelectTrigger className={getInputClassName()}>
            <SelectValue placeholder={props.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {props.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={id}
          type={props.inputType || 'text'}
          value={props.value}
          onChange={props.onChange}
          placeholder={props.placeholder}
          disabled={props.disabled}
          className={getInputClassName()}
        />
      )}
      
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};