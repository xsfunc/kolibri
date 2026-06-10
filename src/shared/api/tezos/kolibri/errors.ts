import { ContractErrors } from "./types";
import { TezosOperationError } from "@taquito/taquito";

export class KolibriContractError extends Error {
  public constructor(
    public readonly code: ContractErrors,
    message: string,
  ) {
    super(message);
    this.name = "KolibriContractError";
  }
}

export function extractContractErrorCode(error: TezosOperationError): ContractErrors | null {
  const lastError = error.errors?.[error.errors.length - 1] as unknown as
    | Record<string, unknown>
    | undefined;
  const withVal = lastError?.["with"];
  if (withVal != null && typeof withVal === "object" && "int" in withVal) {
    const code = Number((withVal as { int: string }).int);
    if (code in ContractErrors) {
      return code as ContractErrors;
    }
  }
  return null;
}

export function handleContractError(e: unknown): never {
  if (e instanceof TezosOperationError) {
    const code = extractContractErrorCode(e);
    if (code !== null) {
      throw new KolibriContractError(code, e.message);
    }
  }
  throw e;
}
