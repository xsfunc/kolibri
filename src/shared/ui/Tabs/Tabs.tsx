import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { css } from "styled-system/css";
import type { ReactNode } from "react";

interface TabItem {
  value: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  items: TabItem[];
}

const tabListStyles = css({
  display: "flex",
  gap: "xs",
  borderBottom: "1px solid token(colors.outline-variant)",
  marginBottom: "md",
});

const tabBaseStyles = css({
  padding: "xs md",
  background: "none",
  border: "none",
  cursor: "pointer",
  textStyle: "body-sm",
  color: "token(colors.on-surface-variant)",
  position: "relative",
  transition: "color 150ms ease",
  _hover: { color: "token(colors.on-surface)" },
  outline: "none",
  _focusVisible: { boxShadow: "0 0 0 2px token(colors.surface-tint)" },
});

const tabActiveStyles = css({
  color: "token(colors.surface-tint)",
  fontWeight: "600",
  _after: {
    content: '""',
    position: "absolute",
    bottom: "-1px",
    left: "0",
    right: "0",
    height: "2px",
    bg: "token(colors.surface-tint)",
  },
});

export const Tabs = ({ value, onValueChange, items }: TabsProps) => (
  <BaseTabs.Root value={value} onValueChange={onValueChange}>
    <BaseTabs.List className={tabListStyles}>
      {items.map((item) => (
        <BaseTabs.Tab
          key={item.value}
          value={item.value}
          className={(state) => `${tabBaseStyles} ${state.active ? tabActiveStyles : ""}`}
        >
          {item.label}
        </BaseTabs.Tab>
      ))}
    </BaseTabs.List>
    {items.map((item) => (
      <BaseTabs.Panel key={item.value} value={item.value}>
        {item.content}
      </BaseTabs.Panel>
    ))}
  </BaseTabs.Root>
);
