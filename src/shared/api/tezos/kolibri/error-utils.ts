import { ContractErrors } from "./types";

const ERROR_ID_SCRIPT_REJECTED = "proto.007-PsDELPH1.michelson_v1.script_rejected";

const ErrorUtils = {
  contractErrorFromTaquitoException: (exception: unknown): ContractErrors => {
    const errors: Array<Record<string, unknown>> = (exception as Record<string, unknown>)
      .errors as Array<Record<string, unknown>>;
    if (errors === undefined) {
      return ContractErrors.Unknown;
    }

    for (let i = 0; i < errors.length; i++) {
      const error = errors[i];
      const id = error.id as string | undefined;
      if (id === undefined) {
        continue;
      }

      if (id === ERROR_ID_SCRIPT_REJECTED) {
        const withValue = error.with as Record<string, unknown> | undefined;
        if (withValue === undefined) {
          continue;
        }

        const errorCodeString = withValue.int as string | undefined;
        if (errorCodeString === undefined) {
          continue;
        }

        const errorCode = parseInt(errorCodeString);
        if (Number.isNaN(errorCode)) {
          continue;
        }

        return errorCode;
      }
    }

    return ContractErrors.Unknown;
  },
};

export default ErrorUtils;
