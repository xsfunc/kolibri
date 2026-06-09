import { useState, useEffect } from "react";
import { useUnit } from "effector-react";
import { setBakerFx } from "../model/model";
import { $bakers, $bakersLoading, loadBakersFx } from "@/entities/baker";
import { Dialog } from "@/shared/ui/Dialog";
import { Autocomplete } from "@/shared/ui/Autocomplete";
import { Button } from "@/shared/ui/Button";
import { css } from "styled-system/css";

interface SetBakerDialogProps {
  ovenAddress: string;
  open: boolean;
  onClose: () => void;
}

export const SetBakerDialog = ({ ovenAddress, open, onClose }: SetBakerDialogProps) => {
  const { setBaker, pending, bakers, bakersLoading, loadBakers } = useUnit({
    setBaker: setBakerFx,
    pending: setBakerFx.pending,
    bakers: $bakers,
    bakersLoading: $bakersLoading,
    loadBakers: loadBakersFx,
  });

  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (open && bakers.length === 0) {
      void loadBakers();
    }
  }, [open, bakers.length, loadBakers]);

  const handleConfirm = async () => {
    await setBaker({ ovenAddress, baker: selected });
    onClose();
  };

  const options = [
    { value: "__none__", label: "None", sublabel: "Remove delegation" },
    ...bakers.map((b) => ({
      value: b.address,
      label: b.alias ?? b.address,
      sublabel: b.alias ? b.address : undefined,
    })),
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Set Baker"
      description="Choose a baker to delegate this oven's XTZ."
    >
      <div className={css({ display: "flex", flexDirection: "column", gap: "token(spacing.md)" })}>
        <Autocomplete
          options={options}
          value={selected}
          onChange={setSelected}
          placeholder="Search baker…"
          label="Baker"
          loading={bakersLoading}
        />
        <Button onClick={handleConfirm} disabled={pending} loading={pending}>
          Confirm
        </Button>
      </div>
    </Dialog>
  );
};
