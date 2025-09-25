'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useId, type ComponentProps } from "react";

/**
 * 表单字段配置
 */
export interface FormFieldConfig {
  label: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  type?: 'text' | 'email' | 'password' | 'number' | 'date';
  description?: string;
}

/**
 * 表单字段状态
 */
export interface FormFieldState {
  value: string | number;
  error?: string;
  touched?: boolean;
}

/**
 * 通用表单字段组件
 */
export interface FormFieldProps extends Omit<ComponentProps<typeof Input>, 'value' | 'onChange'> {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
  description?: string;
}

export function FormField({
  label,
  value,
  onChange,
  error,
  touched,
  required,
  description,
  className,
  ...inputProps
}: FormFieldProps) {
  const hasError = Boolean(touched && error);
  const autoId = useId();
  const fieldId = inputProps.id || `field-${autoId}`;

  return (
    <div className="grid gap-2">
      <Label 
        htmlFor={fieldId}
        className={cn(
          required && "after:content-['*'] after:ml-0.5 after:text-destructive"
        )}
      >
        {label}
      </Label>
      <Input
        {...inputProps}
        id={fieldId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          hasError ? "border-destructive focus-visible:ring-destructive" : undefined,
          className
        )}
        aria-invalid={hasError}
        aria-describedby={
          hasError ? `${fieldId}-error` :
          description ? `${fieldId}-description` : 
          undefined
        }
      />
      {description && !hasError && (
        <div 
          id={`${fieldId}-description`}
          className="text-xs text-muted-foreground"
        >
          {description}
        </div>
      )}
      {hasError && (
        <div 
          id={`${fieldId}-error`}
          className="text-xs text-destructive" 
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * 文本字段组件
 */
export function TextField(props: FormFieldProps) {
  return <FormField type="text" {...props} />;
}

/**
 * 邮箱字段组件
 */
export function EmailField(props: FormFieldProps) {
  return <FormField type="email" {...props} />;
}

/**
 * 数字字段组件
 */
export function NumberField(props: Omit<FormFieldProps, 'value' | 'onChange'> & {
  value: number | '';
  onChange: (value: number | '') => void;
  min?: number;
  max?: number;
}) {
  const handleChange = (stringValue: string) => {
    if (stringValue === '') {
      props.onChange('');
      return;
    }
    const numValue = parseFloat(stringValue);
    if (!isNaN(numValue)) {
      props.onChange(numValue);
    }
  };

  return (
    <FormField
      {...props}
      type="number"
      value={props.value}
      onChange={handleChange}
      min={props.min}
      max={props.max}
    />
  );
}

/**
 * 日期字段组件
 */
export function DateField(props: FormFieldProps) {
  return <FormField type="date" {...props} />;
}
