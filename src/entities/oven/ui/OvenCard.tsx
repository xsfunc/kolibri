import { useUnit } from "effector-react";
import { $ownedOvens, $ovenHealthMap, type HealthLevel } from "../model/model";
import { $refreshingOvenAddress } from "../model/loadOvens";
import { $ovenCalculations } from "../model/calculations";
import { card, skeleton } from "@/shared/ui/styles";
import { css, cx } from "styled-system/css";
import { Progress } from "@/shared/ui/Progress";
import { Button } from "@/shared/ui/Button";
import { truncateAddress, formatToken, formatUsd, formatPercent } from "@/shared/lib/format";
import { BLOCK_EXPLORER_URL } from "@/shared/config/links";
import {
  levelStyles,
  getUtilLevel,
  levelColors,
  levelOutlinedVariant,
} from "@/shared/lib/utilization-levels";

interface OvenCardProps {
  ovenAddress: string;
  onAction: (action: string) => void;
}

export const OvenCard = ({ ovenAddress, onAction }: OvenCardProps) => {
  const { ovens, refreshingAddress, healthMap, calculations } = useUnit({
    ovens: $ownedOvens,
    refreshingAddress: $refreshingOvenAddress,
    healthMap: $ovenHealthMap,
    calculations: $ovenCalculations,
  });
  const oven = ovens?.[ovenAddress];
  const isRefreshing = refreshingAddress === ovenAddress;
  const health = healthMap[ovenAddress];
  const calc = calculations[ovenAddress];

  if (!oven) {
    return (
      <div
        className={card()}
        style={{ borderLeftWidth: "4px", borderLeftColor: "rgba(255,255,255,0.08)" }}
      >
        <div
          className={css({
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "token(spacing.md)",
          })}
        >
          <div>
            <h4
              className={css({
                textStyle: "body-sm",
                fontWeight: "700",
                margin: "0",
              })}
            >
              <a
                href={`${BLOCK_EXPLORER_URL}/${ovenAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className={css({
                  color: "inherit",
                  textDecoration: "underline",
                  textUnderlineOffset: "2px",
                  _hover: { color: "token(colors.primary-fixed-dim)" },
                })}
              >
                {truncateAddress(ovenAddress)}
              </a>
            </h4>
            <p
              className={css({
                textStyle: "body-sm",
                color: "token(colors.on-surface-variant)",
                margin: "0",
              })}
            >
              Status:{" "}
              <span
                className={cx(
                  skeleton({ shape: "inline" }),
                  css({ textStyle: "body-sm", fontVariantNumeric: "tabular-nums" }),
                )}
                style={{ width: "5ch", display: "inline-block", verticalAlign: "middle" }}
              />
            </p>
          </div>
        </div>

        <p
          className={css({
            textStyle: "body-sm",
            color: "token(colors.on-surface-variant)",
            margin: "0",
          })}
        >
          Baker{" "}
          <span
            className={cx(
              skeleton({ shape: "inline" }),
              css({
                textStyle: "body-sm",
                color: "token(colors.primary-fixed-dim)",
                fontVariantNumeric: "tabular-nums",
              }),
            )}
            style={{ width: "8ch", display: "inline-block", verticalAlign: "middle" }}
          />
        </p>

        <div
          className={css({
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            marginBottom: "token(spacing.sm)",
          })}
        >
          <div
            className={css({
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            })}
          >
            <span
              className={css({ textStyle: "body-sm", color: "token(colors.on-surface-variant)" })}
            >
              Collateral Utilization
            </span>
            <span
              className={cx(
                skeleton({ shape: "inline" }),
                css({
                  textStyle: "body-sm",
                  fontWeight: "700",
                  fontVariantNumeric: "tabular-nums",
                }),
              )}
              style={{ width: "5ch" }}
            />
          </div>
          <div
            className={css({
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            })}
          >
            <span
              className={css({ textStyle: "body-sm", color: "token(colors.on-surface-variant)" })}
            >
              Liquidatable at
            </span>
            <span
              className={cx(
                skeleton({ shape: "inline" }),
                css({
                  textStyle: "body-sm",
                  fontWeight: "700",
                  fontVariantNumeric: "tabular-nums",
                }),
              )}
              style={{ width: "6ch" }}
            />
          </div>
        </div>

        <div
          className={cx(skeleton({ shape: "inline" }))}
          style={{
            height: "4px",
            borderRadius: "token(radii.full)",
            marginBottom: "token(spacing.sm)",
            width: "100%",
            display: "block",
          }}
        />

        <div
          className={css({
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            marginBottom: "token(spacing.md)",
          })}
        >
          <div
            className={css({
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingY: "3px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            })}
          >
            <span
              className={css({ textStyle: "body-sm", color: "token(colors.on-surface-variant)" })}
            >
              Collateral Value
            </span>
            <span
              className={cx(
                skeleton({ shape: "inline" }),
                css({
                  textStyle: "body-sm",
                  fontWeight: "700",
                  fontVariantNumeric: "tabular-nums",
                }),
              )}
              style={{ width: "7ch" }}
            />
          </div>
          <div
            className={css({
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingY: "3px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            })}
          >
            <span
              className={css({ textStyle: "body-sm", color: "token(colors.on-surface-variant)" })}
            >
              Balance
            </span>
            <span
              className={cx(
                skeleton({ shape: "inline" }),
                css({
                  textStyle: "body-sm",
                  fontWeight: "700",
                  fontVariantNumeric: "tabular-nums",
                }),
              )}
              style={{ width: "8ch" }}
            />
          </div>
          <div
            className={css({
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingY: "3px",
            })}
          >
            <span
              className={css({ textStyle: "body-sm", color: "token(colors.on-surface-variant)" })}
            >
              Loan Amount
            </span>
            <span
              className={cx(
                skeleton({ shape: "inline" }),
                css({
                  textStyle: "body-sm",
                  fontWeight: "700",
                  fontVariantNumeric: "tabular-nums",
                }),
              )}
              style={{ width: "7ch" }}
            />
          </div>
        </div>

        <div
          className={skeleton({ shape: "block" })}
          style={{ height: "28px", borderRadius: "token(radii.full)" }}
        />
      </div>
    );
  }

  const healthLevel: HealthLevel = health?.level ?? "safe";

  const collateralXtz = calc?.collateralXtz ?? oven.balance.dividedBy(1e6);
  const debtKusd = calc?.debtKusd ?? oven.outstandingTokens.dividedBy(1e18);
  const collateralValueUsd = calc?.collateralValueUsd ?? null;
  const utilizationPct = calc?.utilizationPct;
  const liquidationPrice = calc?.liquidationPrice ?? null;
  const utilLevel = getUtilLevel(utilizationPct ?? 0);

  return (
    <div
      className={card()}
      style={{ borderLeftWidth: "4px", borderLeftColor: levelColors[healthLevel] }}
    >
      <div
        className={css({
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "token(spacing.md)",
        })}
      >
        <div>
          <h4
            className={css({
              textStyle: "body-sm",
              fontWeight: "700",
              margin: "0",
              color: levelStyles[healthLevel],
            })}
          >
            <a
              href={`${BLOCK_EXPLORER_URL}/${ovenAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className={css({
                color: "inherit",
                textDecoration: "underline",
                textUnderlineOffset: "2px",
                _hover: { color: "token(colors.primary-fixed-dim)" },
              })}
            >
              {truncateAddress(ovenAddress)}
            </a>
          </h4>
          <p
            className={css({
              textStyle: "body-sm",
              color: "token(colors.on-surface-variant)",
              margin: "0",
            })}
          >
            Status: {oven.isLiquidated ? "liquidated" : "active"}
          </p>
        </div>
      </div>

      {oven.baker && (
        <p
          className={css({
            textStyle: "body-sm",
            color: "token(colors.on-surface-variant)",
            margin: "0",
          })}
        >
          Baker{" "}
          <a
            href={`${BLOCK_EXPLORER_URL}/${oven.baker}`}
            target="_blank"
            rel="noopener noreferrer"
            className={css({
              color: "token(colors.primary-fixed-dim)",
              textDecoration: "none",
              textUnderlineOffset: "2px",
              _hover: { textDecoration: "underline" },
            })}
          >
            {truncateAddress(oven.baker)}
          </a>
        </p>
      )}

      <div
        className={css({
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          marginBottom: "token(spacing.sm)",
        })}
      >
        <div
          className={css({
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          })}
        >
          <span
            className={css({ textStyle: "body-sm", color: "token(colors.on-surface-variant)" })}
          >
            Collateral utilization
          </span>
          <span
            className={css({
              textStyle: "body-sm",
              fontWeight: "700",
              fontVariantNumeric: "tabular-nums",
              color: levelStyles[utilLevel],
            })}
          >
            {utilizationPct != null ? (
              formatPercent(utilizationPct)
            ) : (
              <span
                className={cx(
                  skeleton({ shape: "inline" }),
                  css({
                    textStyle: "body-sm",
                    fontWeight: "700",
                    fontVariantNumeric: "tabular-nums",
                  }),
                )}
                style={{ width: "5ch", display: "inline-block" }}
              />
            )}
          </span>
        </div>
        <div
          className={css({
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          })}
        >
          <span
            className={css({ textStyle: "body-sm", color: "token(colors.on-surface-variant)" })}
          >
            Liquidatable at
          </span>
          <span
            className={css({
              textStyle: "body-sm",
              fontWeight: "700",
              fontVariantNumeric: "tabular-nums",
            })}
          >
            {liquidationPrice != null ? (
              formatUsd(liquidationPrice.toNumber(), 4)
            ) : calc != null ? (
              "—"
            ) : (
              <span
                className={cx(
                  skeleton({ shape: "inline" }),
                  css({
                    textStyle: "body-sm",
                    fontWeight: "700",
                    fontVariantNumeric: "tabular-nums",
                  }),
                )}
                style={{ width: "6ch", display: "inline-block" }}
              />
            )}
          </span>
        </div>
      </div>

      <div className={css({ marginBottom: "token(spacing.sm)" })}>
        {utilizationPct != null ? (
          <Progress value={utilizationPct} max={100} level={utilLevel} />
        ) : (
          <div
            className={cx(skeleton({ shape: "inline" }))}
            style={{
              height: "4px",
              borderRadius: "token(radii.full)",
              width: "100%",
              display: "block",
            }}
          />
        )}
      </div>

      <div
        className={css({
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          marginBottom: "token(spacing.md)",
        })}
      >
        <div
          className={css({
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingY: "3px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          })}
        >
          <span
            className={css({ textStyle: "body-sm", color: "token(colors.on-surface-variant)" })}
          >
            Collateral value
          </span>
          <span
            className={css({
              textStyle: "body-sm",
              fontWeight: "700",
              fontVariantNumeric: "tabular-nums",
            })}
          >
            {collateralValueUsd != null ? (
              formatUsd(collateralValueUsd.toNumber())
            ) : (
              <span
                className={cx(
                  skeleton({ shape: "inline" }),
                  css({
                    textStyle: "body-sm",
                    fontWeight: "700",
                    fontVariantNumeric: "tabular-nums",
                  }),
                )}
                style={{ width: "7ch", display: "inline-block" }}
              />
            )}
          </span>
        </div>
        <div
          className={css({
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingY: "3px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          })}
        >
          <span
            className={css({ textStyle: "body-sm", color: "token(colors.on-surface-variant)" })}
          >
            Balance
          </span>
          <span
            className={css({
              textStyle: "body-sm",
              fontWeight: "700",
              fontVariantNumeric: "tabular-nums",
            })}
          >
            {formatToken(collateralXtz.toNumber(), "XTZ")}
          </span>
        </div>
        <div
          className={css({
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingY: "3px",
          })}
        >
          <span
            className={css({ textStyle: "body-sm", color: "token(colors.on-surface-variant)" })}
          >
            Loan amount
          </span>
          <span
            className={css({
              textStyle: "body-sm",
              fontWeight: "700",
              fontVariantNumeric: "tabular-nums",
            })}
          >
            {formatToken(debtKusd.toNumber(), "kUSD")}
          </span>
        </div>
      </div>

      <Button
        variant={levelOutlinedVariant[healthLevel]}
        size="sm"
        disabled={isRefreshing}
        onClick={() => onAction("deposit")}
        aria-label={`Manage oven ${truncateAddress(ovenAddress)}`}
        className={css({ width: "100%" })}
      >
        Manage
      </Button>
    </div>
  );
};

export const SkeletonOvenCard = () => (
  <div
    className={card()}
    style={{ borderLeftWidth: "4px", borderLeftColor: "rgba(255,255,255,0.08)" }}
  >
    <div
      className={css({
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "token(spacing.md)",
      })}
    >
      <div>
        <div
          className={cx(
            skeleton({ shape: "inline" }),
            css({ textStyle: "body-sm", fontWeight: "700" }),
          )}
          style={{ width: "10ch" }}
        />
        <p
          className={css({
            textStyle: "body-sm",
            color: "token(colors.on-surface-variant)",
            margin: "0",
            marginTop: "4px",
          })}
        >
          Status:{" "}
          <span
            className={cx(
              skeleton({ shape: "inline" }),
              css({ textStyle: "body-sm", fontVariantNumeric: "tabular-nums" }),
            )}
            style={{ width: "5ch", display: "inline-block", verticalAlign: "middle" }}
          />
        </p>
      </div>
    </div>

    <p
      className={css({
        textStyle: "body-sm",
        color: "token(colors.on-surface-variant)",
        margin: "0",
      })}
    >
      Baker{" "}
      <span
        className={cx(
          skeleton({ shape: "inline" }),
          css({
            textStyle: "body-sm",
            color: "token(colors.primary-fixed-dim)",
            fontVariantNumeric: "tabular-nums",
          }),
        )}
        style={{ width: "8ch", display: "inline-block", verticalAlign: "middle" }}
      />
    </p>

    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        marginBottom: "token(spacing.sm)",
      })}
    >
      <div
        className={css({
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        })}
      >
        <span className={css({ textStyle: "body-sm", color: "token(colors.on-surface-variant)" })}>
          Collateral Utilization
        </span>
        <span
          className={cx(
            skeleton({ shape: "inline" }),
            css({ textStyle: "body-sm", fontWeight: "700", fontVariantNumeric: "tabular-nums" }),
          )}
          style={{ width: "5ch" }}
        />
      </div>
      <div
        className={css({
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        })}
      >
        <span className={css({ textStyle: "body-sm", color: "token(colors.on-surface-variant)" })}>
          Liquidatable at
        </span>
        <span
          className={cx(
            skeleton({ shape: "inline" }),
            css({ textStyle: "body-sm", fontWeight: "700", fontVariantNumeric: "tabular-nums" }),
          )}
          style={{ width: "6ch" }}
        />
      </div>
    </div>

    <div
      className={cx(skeleton({ shape: "inline" }))}
      style={{
        height: "4px",
        borderRadius: "token(radii.full)",
        marginBottom: "token(spacing.sm)",
        width: "100%",
        display: "block",
      }}
    />

    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        marginBottom: "token(spacing.md)",
      })}
    >
      <div
        className={css({
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingY: "3px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        })}
      >
        <span className={css({ textStyle: "body-sm", color: "token(colors.on-surface-variant)" })}>
          Collateral Value
        </span>
        <span
          className={cx(
            skeleton({ shape: "inline" }),
            css({ textStyle: "body-sm", fontWeight: "700", fontVariantNumeric: "tabular-nums" }),
          )}
          style={{ width: "7ch" }}
        />
      </div>
      <div
        className={css({
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingY: "3px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        })}
      >
        <span className={css({ textStyle: "body-sm", color: "token(colors.on-surface-variant)" })}>
          Balance
        </span>
        <span
          className={cx(
            skeleton({ shape: "inline" }),
            css({ textStyle: "body-sm", fontWeight: "700", fontVariantNumeric: "tabular-nums" }),
          )}
          style={{ width: "8ch" }}
        />
      </div>
      <div
        className={css({
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingY: "3px",
        })}
      >
        <span className={css({ textStyle: "body-sm", color: "token(colors.on-surface-variant)" })}>
          Loan Amount
        </span>
        <span
          className={cx(
            skeleton({ shape: "inline" }),
            css({ textStyle: "body-sm", fontWeight: "700", fontVariantNumeric: "tabular-nums" }),
          )}
          style={{ width: "7ch" }}
        />
      </div>
    </div>

    <div
      className={skeleton({ shape: "block" })}
      style={{ height: "28px", borderRadius: "token(radii.full)" }}
    />
  </div>
);
