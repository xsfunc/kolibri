import { useUnit } from "effector-react";
import {
  $bakerDialogOpen,
  $selectedBaker,
  NO_BAKER_VALUE,
  bakerDialogClosed,
  bakerSelected,
  bakerSubmitted,
  setBakerFx,
} from "../model/model";
import { $bakers, $bakersLoading } from "@/entities/baker";
import { Dialog } from "@/shared/ui/Dialog";
import { Autocomplete } from "@/shared/ui/Autocomplete";
import { Button } from "@/shared/ui/Button";
import { css } from "styled-system/css";

export const SetBakerDialog = () => {
  const { open, onClose, selected, onSelected, onSubmit, pending, bakers, bakersLoading } = useUnit(
    {
      open: $bakerDialogOpen,
      onClose: bakerDialogClosed,
      selected: $selectedBaker,
      onSelected: bakerSelected,
      onSubmit: bakerSubmitted,
      pending: setBakerFx.pending,
      bakers: $bakers,
      bakersLoading: $bakersLoading,
    },
  );

  const options = [
    { value: NO_BAKER_VALUE, label: "None", sublabel: "Remove delegation" },
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
          onChange={onSelected}
          placeholder="Search baker…"
          label="Baker"
          loading={bakersLoading}
        />
        <Button onClick={onSubmit} disabled={pending} loading={pending}>
          Confirm
        </Button>
      </div>
    </Dialog>
  );
};
