import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { Radio } from "@base-ui/react/radio";
import { radioCard } from "@/shared/ui/styles";
import type { ReactNode } from "react";

interface RadioGroupProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
  name?: string;
  children: ReactNode;
  className?: string;
}

export const RadioGroup = <T extends string>({
  value,
  onValueChange,
  name,
  children,
  className,
}: RadioGroupProps<T>) => (
  <BaseRadioGroup value={value} onValueChange={onValueChange} name={name} className={className}>
    {children}
  </BaseRadioGroup>
);

interface RadioCardProps<T extends string> {
  value: T;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

export const RadioCard = <T extends string>({
  value,
  disabled,
  children,
  className,
}: RadioCardProps<T>) => (
  <Radio.Root value={value} disabled={disabled} className={`${radioCard()} ${className ?? ""}`}>
    {children}
  </Radio.Root>
);
