'use client';

import * as React from 'react';

import type { PlateEditor, PlateElementProps } from "platejs/react";
import {
  IconCalendar,
  IconChevronRight,
  IconCode,
  IconH1,
  IconH2,
  IconH3,
  IconBulb,
  IconList,
  IconListNumbers,
  IconPilcrow,
  IconQuote,
  IconSquare,
  IconTable,
  IconCodeDots,
} from "@tabler/icons-react";
import { type TComboboxInputElement, KEYS } from "platejs";
import { PlateElement } from "platejs/react";

import {
  insertBlock,
  insertInlineElement,
} from "@/components/editor/transforms";

import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxGroupLabel,
  InlineComboboxInput,
  InlineComboboxItem,
} from "./inline-combobox";

type Group = {
  group: string;
  items: {
    icon: React.ReactNode;
    value: string;
    onSelect: (editor: PlateEditor, value: string) => void;
    className?: string;
    focusEditor?: boolean;
    keywords?: string[];
    label?: string;
  }[];
};

const groups: Group[] = [
  {
    group: "Basic blocks",
    items: [
      {
        icon: <IconPilcrow />,
        keywords: ["paragraph"],
        label: "Text",
        value: KEYS.p,
      },
      {
        icon: <IconH1 />,
        keywords: ["title", "h1"],
        label: "Heading 1",
        value: KEYS.h1,
      },
      {
        icon: <IconH2 />,
        keywords: ["subtitle", "h2"],
        label: "Heading 2",
        value: KEYS.h2,
      },
      {
        icon: <IconH3 />,
        keywords: ["subtitle", "h3"],
        label: "Heading 3",
        value: KEYS.h3,
      },
      {
        icon: <IconList />,
        keywords: ["unordered", "ul", "-"],
        label: "Bulleted list",
        value: KEYS.ul,
      },
      {
        icon: <IconListNumbers />,
        keywords: ["ordered", "ol", "1"],
        label: "Numbered list",
        value: KEYS.ol,
      },
      {
        icon: <IconSquare />,
        keywords: ["checklist", "task", "checkbox", "[]"],
        label: "To-do list",
        value: KEYS.listTodo,
      },
      {
        icon: <IconChevronRight />,
        keywords: ["collapsible", "expandable"],
        label: "Toggle",
        value: KEYS.toggle,
      },
      {
        icon: <IconCode />,
        keywords: ["```"],
        label: "Code Block",
        value: KEYS.codeBlock,
      },
      {
        icon: <IconTable />,
        label: "Table",
        value: KEYS.table,
      },
      {
        icon: <IconQuote />,
        keywords: ["citation", "blockquote", "quote", ">"],
        label: "Blockquote",
        value: KEYS.blockquote,
      },
      {
        description: "Insert a highlighted block.",
        icon: <IconBulb />,
        keywords: ["note"],
        label: "Callout",
        value: KEYS.callout,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value, { upsert: true });
      },
    })),
  },
  // {
  //   group: "Advanced blocks",
  //   items: [
  //     {
  //       icon: <IconListDetails />,
  //       keywords: ["toc"],
  //       label: "Table of contents",
  //       value: KEYS.toc,
  //     },
  //   ].map((item) => ({
  //     ...item,
  //     onSelect: (editor, value) => {
  //       insertBlock(editor, value, { upsert: true });
  //     },
  //   })),
  // },
  {
    group: "Inline",
    items: [
      {
        focusEditor: true,
        icon: <IconCalendar />,
        keywords: ["time"],
        label: "Date",
        value: KEYS.date,
      },
      {
        focusEditor: true,
        icon: <IconCodeDots />,
        keywords: ["code"],
        label: "Inline code",
        value: KEYS.code,
      }
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertInlineElement(editor, value);
      },
    })),
  },
];

export function SlashInputElement(
  props: PlateElementProps<TComboboxInputElement>
) {
  const { editor, element } = props;

  return (
    <PlateElement {...props} as="span">
      <InlineCombobox element={element} trigger="/">
        <InlineComboboxInput />

        <InlineComboboxContent>
          <InlineComboboxEmpty>No results</InlineComboboxEmpty>

          {groups.map(({ group, items }) => (
            <InlineComboboxGroup key={group}>
              <InlineComboboxGroupLabel>{group}</InlineComboboxGroupLabel>

              {items.map(
                ({ focusEditor, icon, keywords, label, value, onSelect }) => (
                  <InlineComboboxItem
                    key={value}
                    value={value}
                    onClick={() => onSelect(editor, value)}
                    label={label}
                    focusEditor={focusEditor}
                    group={group}
                    keywords={keywords}
                  >
                    <div className="mr-2 text-muted-foreground">{icon}</div>
                    {label ?? value}
                  </InlineComboboxItem>
                )
              )}
            </InlineComboboxGroup>
          ))}
        </InlineComboboxContent>
      </InlineCombobox>

      {props.children}
    </PlateElement>
  );
}
