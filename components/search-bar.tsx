import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { IconSearch } from "@tabler/icons-react";
import { Kbd, KbdGroup } from "./ui/kbd";

export default function SearchBar() {
  return (
    <InputGroup>
      <InputGroupInput placeholder="Search..." />
      <InputGroupAddon>
        <IconSearch />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>k</Kbd>
        </KbdGroup>
      </InputGroupAddon>
    </InputGroup>
  );
}
