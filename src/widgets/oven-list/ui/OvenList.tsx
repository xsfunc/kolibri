import { useState } from "react";
import { useUnit } from "effector-react";
import { $ovenList, $ovensLoading } from "@/entities/oven/model/model";
import { $ovensLoadPending } from "@/entities/oven/model/loadOvens";
import { $walletPKH } from "@/entities/wallet/model/model";
import { loadOvensFx } from "@/entities/oven/model/loadOvens";
import { OvenCard } from "@/entities/oven";
import { OvenManageDialog } from "@/features/manage-oven";
import { SetBakerDialog } from "@/features/set-baker";
import { Button } from "@/shared/ui/Button";
import { css } from "../../../../styled-system/css";
import { grid } from "../../../../styled-system/patterns";

export const OvenList = () => {
  const { ovenList, loading, pending, pkh, load } = useUnit({
    ovenList: $ovenList,
    loading: $ovensLoading,
    pending: $ovensLoadPending,
    pkh: $walletPKH,
    load: loadOvensFx,
  });

  const [manageOven, setManageOven] = useState<string | null>(null);
  const [manageTab, setManageTab] = useState<string>("deposit");
  const [bakerOven, setBakerOven] = useState<string | null>(null);

  const handleAction = (ovenAddress: string, action: string) => {
    if (action === "baker") {
      setBakerOven(ovenAddress);
    } else {
      setManageTab(action);
      setManageOven(ovenAddress);
    }
  };

  const handleRefresh = () => {
    if (pkh) void load(pkh);
  };

  if (loading && ovenList.length === 0) {
    return (
      <div
        className={css({
          padding: "token(spacing.xl)",
          textAlign: "center",
          color: "token(colors.on-surface-variant)",
          textStyle: "body-md",
        })}
      >
        Loading your ovens…
      </div>
    );
  }

  return (
    <div className={css({ padding: "token(spacing.md) token(spacing.lg)" })}>
      <div
        className={css({
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "token(spacing.lg)",
        })}
      >
        <h2
          className={css({
            textStyle: "headline-md",
            color: "token(colors.on-surface)",
            margin: "0",
          })}
        >
          Your Ovens
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={pending}
          loading={pending}
        >
          Refresh
        </Button>
      </div>

      {ovenList.length === 0 ? (
        <p className={css({ color: "token(colors.on-surface-variant)", textStyle: "body-md" })}>
          No ovens found. Create one to get started.
        </p>
      ) : (
        <div
          className={grid({
            columns: { base: 1, md: 2, lg: 3 },
            gap: "token(spacing.md)",
          })}
        >
          {ovenList.map((oven) => (
            <OvenCard
              key={oven.ovenAddress}
              ovenAddress={oven.ovenAddress}
              onAction={(action) => handleAction(oven.ovenAddress, action)}
            />
          ))}
        </div>
      )}

      {manageOven && (
        <OvenManageDialog
          ovenAddress={manageOven}
          open={true}
          onClose={() => setManageOven(null)}
          initialTab={manageTab}
        />
      )}

      {bakerOven && (
        <SetBakerDialog ovenAddress={bakerOven} open={true} onClose={() => setBakerOven(null)} />
      )}
    </div>
  );
};
