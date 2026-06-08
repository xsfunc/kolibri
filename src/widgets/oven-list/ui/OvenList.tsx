import { useState } from "react";
import { useUnit } from "effector-react";
import {
  $ovenList,
  $ovensLoading,
  $ovensLoadProgress,
  $ovenAddressesPending,
} from "@/entities/oven/model/model";
import { $ovensLoadPending } from "@/entities/oven/model/loadOvens";
import { $walletPKH } from "@/entities/wallet/model/model";
import { loadOvensFx } from "@/entities/oven/model/loadOvens";
import { OvenCard } from "@/entities/oven";
import { OvenManageDialog } from "@/features/manage-oven";
import { SetBakerDialog } from "@/features/set-baker";
import { Button } from "@/shared/ui/Button";
import { Progress } from "@/shared/ui/Progress";
import { css } from "../../../../styled-system/css";
import { grid } from "../../../../styled-system/patterns";
import { RefreshCw } from "lucide-react";

export const OvenList = () => {
  const { ovenList, loading, pending, pkh, load, progress, pendingAddresses } = useUnit({
    ovenList: $ovenList,
    loading: $ovensLoading,
    pending: $ovensLoadPending,
    pkh: $walletPKH,
    load: loadOvensFx,
    progress: $ovensLoadProgress,
    pendingAddresses: $ovenAddressesPending,
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

  const hasAddresses = pendingAddresses.length > 0 || progress !== null;

  return (
    <div>
      {progress && progress.total > 0 && (
        <div
          className={css({
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
          })}
        >
          <Progress value={progress.loaded} max={progress.total} level="safe" />
        </div>
      )}

      <div
        className={css({
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "token(spacing.lg)",
        })}
      >
        <div className={css({ display: "flex", alignItems: "center", gap: "token(spacing.sm)" })}>
          <h2
            className={css({
              textStyle: "headline-sm",
              color: "token(colors.on-surface)",
              fontWeight: "600",
              margin: "0",
            })}
          >
            My Ovens
          </h2>
          <span
            className={css({
              textStyle: "label-md",
              color: "token(colors.primary-fixed-dim)",
              bg: "rgba(0, 226, 144, 0.1)",
              padding: "2px 8px",
              borderRadius: "token(radii.full)",
            })}
          >
            {ovenList.length} Active
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={pending}>
          <RefreshCw size={14} />
          {pending && progress && progress.total > 0
            ? `${progress.loaded}/${progress.total}`
            : "Refresh"}
        </Button>
      </div>

      {ovenList.length === 0 && !hasAddresses && !loading ? (
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
          {pendingAddresses
            .filter((addr) => !ovenList.some((o) => o.ovenAddress === addr))
            .map((addr) => (
              <OvenCard key={addr} ovenAddress={addr} onAction={() => {}} />
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
