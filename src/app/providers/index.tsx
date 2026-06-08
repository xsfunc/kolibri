// TODO: Step 10 — root providers (BigNumber config, future: error boundary)
import type { ReactNode } from "react";
import "../../shared/lib/bignumber";

interface ProvidersProps {
  children: ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return <>{children}</>;
};
