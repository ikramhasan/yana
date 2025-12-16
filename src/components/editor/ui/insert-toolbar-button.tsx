'use client';

import * as React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import {
  IconCalendar,
  IconChevronRight,
  IconFileCode,
  IconH1,
  IconH2,
  IconH3,
  IconPhoto,
  IconLink,
  IconList,
  IconListNumbers,
  IconMinus,
  IconPilcrow,
  IconPlus,
  IconQuote,
  IconSquare,
  IconTable,
  IconListDetails,
} from "@tabler/icons-react";
import { KEYS } from "platejs";
import { type PlateEditor, useEditorRef } from "platejs/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  insertBlock,
  insertInlineElement,
} from "@/components/editor/transforms";

import { ToolbarButton, ToolbarMenuGroup } from "./toolbar";

type Group = {
  group: string;
  items: Item[];
};

type Item = {
  icon: React.ReactNode;
  value: string;
  onSelect: (editor: PlateEditor, value: string) => void;
  focusEditor?: boolean;
  label?: string;
};

const groups: Group[] = [
  {
    group: "Basic blocks",
    items: [
      {
        icon: <IconPilcrow />,
        label: "Paragraph",
        value: KEYS.p,
      },
      {
        icon: <IconH1 />,
        label: "Heading 1",
        value: "h1",
      },
      {
        icon: <IconH2 />,
        label: "Heading 2",
        value: "h2",
      },
      {
        icon: <IconH3 />,
        label: "Heading 3",
        value: "h3",
      },
      {
        icon: <IconTable />,
        label: "Table",
        value: KEYS.table,
      },
      {
        icon: <IconFileCode />,
        label: "Code",
        value: KEYS.codeBlock,
      },
      {
        icon: <IconQuote />,
        label: "Quote",
        value: KEYS.blockquote,
      },
      {
        icon: <IconMinus />,
        label: "Divider",
        value: KEYS.hr,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: "Lists",
    items: [
      {
        icon: <IconList />,
        label: "Bulleted list",
        value: KEYS.ul,
      },
      {
        icon: <IconListNumbers />,
        label: "Numbered list",
        value: KEYS.ol,
      },
      {
        icon: <IconSquare />,
        label: "To-do list",
        value: KEYS.listTodo,
      },
      {
        icon: <IconChevronRight />,
        label: "Toggle list",
        value: KEYS.toggle,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: "Media",
    items: [
      {
        icon: <IconPhoto />,
        label: "Image",
        value: KEYS.img,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: "Advanced blocks",
    items: [
      {
        icon: <IconListDetails />,
        label: "Table of contents",
        value: KEYS.toc,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: "Inline",
    items: [
      {
        icon: <IconLink />,
        label: "Link",
        value: KEYS.link,
      },
      {
        focusEditor: true,
        icon: <IconCalendar />,
        label: "Date",
        value: KEYS.date,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertInlineElement(editor, value);
      },
    })),
  },
];

export function InsertToolbarButton(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          pressed={open}
          tooltip="Insert"
          isDropdown
          className="flex items-center gap-2"
        >
          <IconPlus /> <span>Insert</span>
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="flex max-h-[500px] min-w-[200px] w-auto flex-col overflow-y-auto"
        align="start"
      >
        {groups.map(({ group, items: nestedItems }) => (
          <ToolbarMenuGroup key={group} label={group}>
            {nestedItems.map(({ icon, label, value, onSelect }) => (
              <DropdownMenuItem
                key={value}
                className="min-w-[180px]"
                onSelect={() => {
                  onSelect(editor, value);
                  editor.tf.focus();
                }}
              >
                {icon}
                {label}
              </DropdownMenuItem>
            ))}
          </ToolbarMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
