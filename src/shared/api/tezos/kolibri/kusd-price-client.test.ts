import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import BigNumber from "bignumber.js";
import KusdPriceClient from "./kusd-price-client";

const POOL_ADDRESS = "KT1K4EwTpbvYN9agJdjpyJm4ZZdhpUNKB3F6";

function createMockTezos(storageResult: Record<string, unknown>) {
  return {
    contract: {
      at: vi.fn().mockResolvedValue({
        storage: vi.fn().mockResolvedValue(storageResult),
      }),
    },
  } as unknown as import("@taquito/taquito").TezosToolkit;
}

describe("KusdPriceClient", () => {
  let client: KusdPriceClient;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getkUSDPriceFromTzKT", () => {
    it("calculates kUSD price from TzKT storage response", async () => {
      const mockTezos = createMockTezos({});
      client = new KusdPriceClient(mockTezos, POOL_ADDRESS, "https://api.tzkt.io/v1");

      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          storage: {
            tez_pool: "1000000000",
            token_pool: "500000000000000000000",
            last_update_time: "2025-06-09T12:00:00Z",
          },
        }),
      } as unknown as Response);

      const result = await client.getkUSDPriceFromTzKT(new BigNumber("0.56"));

      expect(result.price.toNumber()).toBeCloseTo(1.12, 2);
      expect(result.pegPercent.toNumber()).toBeCloseTo(12, 1);
      expect(result.timestamp).toBe(new Date("2025-06-09T12:00:00Z").getTime());
      expect(fetch).toHaveBeenCalledWith(
        `https://api.tzkt.io/v1/contracts/${POOL_ADDRESS}/storage`,
      );
    });

    it("uses default TzKT URL when not provided", async () => {
      const mockTezos = createMockTezos({});
      client = new KusdPriceClient(mockTezos, POOL_ADDRESS);

      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          storage: {
            tez_pool: "1000000000",
            token_pool: "500000000000000000000",
            last_update_time: "2025-01-01T00:00:00Z",
          },
        }),
      } as unknown as Response);

      await client.getkUSDPriceFromTzKT(new BigNumber("0.50"));

      expect(fetch).toHaveBeenCalledWith(
        `https://api.tzkt.io/v1/contracts/${POOL_ADDRESS}/storage`,
      );
    });
  });

  describe("getkUSDPriceFromContract", () => {
    it("calculates kUSD price from Taquito contract storage", async () => {
      const mockTezos = createMockTezos({
        storage: {
          tez_pool: new BigNumber("1000000000"),
          token_pool: new BigNumber("500000000000000000000"),
          last_update_time: "2025-06-09T12:00:00Z",
        },
      });
      client = new KusdPriceClient(mockTezos, POOL_ADDRESS, "https://api.tzkt.io/v1");

      const result = await client.getkUSDPriceFromContract(new BigNumber("0.56"));

      expect(result.price.toNumber()).toBeCloseTo(1.12, 2);
      expect(result.pegPercent.toNumber()).toBeCloseTo(12, 1);
      expect(result.timestamp).toBe(new Date("2025-06-09T12:00:00Z").getTime());
    });
  });

  describe("price calculation edge cases", () => {
    beforeEach(() => {
      const mockTezos = createMockTezos({});
      client = new KusdPriceClient(mockTezos, POOL_ADDRESS, "https://api.tzkt.io/v1");
    });

    it("returns pegPercent ~0 when kUSD is at $1", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          storage: {
            tez_pool: "1000000000",
            token_pool: "500000000000000000000",
            last_update_time: "2025-01-01T00:00:00Z",
          },
        }),
      } as unknown as Response);

      const result = await client.getkUSDPriceFromTzKT(new BigNumber("0.50"));

      expect(result.price.toNumber()).toBeCloseTo(1.0, 6);
      expect(result.pegPercent.toNumber()).toBeCloseTo(0, 4);
    });

    it("returns negative pegPercent when kUSD is below peg", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          storage: {
            tez_pool: "1000000000",
            token_pool: "600000000000000000000",
            last_update_time: "2025-01-01T00:00:00Z",
          },
        }),
      } as unknown as Response);

      const result = await client.getkUSDPriceFromTzKT(new BigNumber("0.50"));

      expect(result.price.toNumber()).toBeCloseTo(0.8333, 3);
      expect(result.pegPercent.toNumber()).toBeCloseTo(-16.67, 1);
    });

    it("handles large pool values without precision loss", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          storage: {
            tez_pool: "50000000000000",
            token_pool: "25000000000000000000000000",
            last_update_time: "2025-01-01T00:00:00Z",
          },
        }),
      } as unknown as Response);

      const result = await client.getkUSDPriceFromTzKT(new BigNumber("0.56"));

      expect(result.price.toNumber()).toBeCloseTo(1.12, 2);
    });
  });
});
