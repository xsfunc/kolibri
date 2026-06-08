import BigNumber from "bignumber.js";

const COMPOUND_PERIOD_SECONDS = 60;

const CONSTANTS = {
  COMPOUND_PERIOD_SECONDS,
  COMPOUNDS_PER_YEAR: (365 * 24 * 60 * 60) / COMPOUND_PERIOD_SECONDS,
  PRECISION: new BigNumber(Math.pow(10, 18)),
};

export default CONSTANTS;
