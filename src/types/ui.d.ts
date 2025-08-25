declare module '@/components/ui/button' {
  import { ButtonHTMLAttributes, ReactNode } from 'react';
  
  interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    children?: ReactNode;
  }
  
  export const Button: React.FC<ButtonProps>;
}

declare module '@/components/ui/input' {
  import { InputHTMLAttributes } from 'react';
  
  interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    type?: string;
  }
  
  export const Input: React.FC<InputProps>;
}

declare module '@/components/ui/label' {
  import { LabelHTMLAttributes } from 'react';
  
  interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
    htmlFor?: string;
  }
  
  export const Label: React.FC<LabelProps>;
}

declare module '@/components/ui/select' {
  import { ReactNode } from 'react';
  
  interface SelectProps {
    value?: string;
    onValueChange?: (value: string) => void;
    children?: ReactNode;
    disabled?: boolean;
    required?: boolean;
  }
  
  interface SelectTriggerProps {
    children?: ReactNode;
  }
  
  interface SelectContentProps {
    children?: ReactNode;
  }
  
  interface SelectItemProps {
    value: string;
    children?: ReactNode;
    disabled?: boolean;
  }
  
  interface SelectValueProps {
    placeholder?: string;
  }
  
  export const Select: React.FC<SelectProps>;
  export const SelectTrigger: React.FC<SelectTriggerProps>;
  export const SelectContent: React.FC<SelectContentProps>;
  export const SelectItem: React.FC<SelectItemProps>;
  export const SelectValue: React.FC<SelectValueProps>;
}

declare module '@/components/ui/dialog' {
  import { ReactNode } from 'react';
  
  interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: ReactNode;
  }
  
  interface DialogContentProps {
    className?: string;
    children?: ReactNode;
  }
  
  interface DialogHeaderProps {
    children?: ReactNode;
  }
  
  interface DialogTitleProps {
    children?: ReactNode;
    className?: string;
  }
  
  interface DialogFooterProps {
    children?: ReactNode;
    className?: string;
  }
  
  interface DialogTriggerProps {
    asChild?: boolean;
    children?: ReactNode;
  }
  
  export const Dialog: React.FC<DialogProps>;
  export const DialogContent: React.FC<DialogContentProps>;
  export const DialogHeader: React.FC<DialogHeaderProps>;
  export const DialogTitle: React.FC<DialogTitleProps>;
  export const DialogFooter: React.FC<DialogFooterProps>;
  export const DialogTrigger: React.FC<DialogTriggerProps>;
}

declare module '@/components/ui/card' {
  import { ReactNode } from 'react';
  
  interface CardProps {
    className?: string;
    children?: ReactNode;
    onClick?: () => void;
  }
  
  interface CardContentProps {
    className?: string;
    children?: ReactNode;
  }
  
  interface CardHeaderProps {
    className?: string;
    children?: ReactNode;
  }
  
  interface CardTitleProps {
    className?: string;
    children?: ReactNode;
  }
  
  export const Card: React.FC<CardProps>;
  export const CardContent: React.FC<CardContentProps>;
  export const CardHeader: React.FC<CardHeaderProps>;
  export const CardTitle: React.FC<CardTitleProps>;
}