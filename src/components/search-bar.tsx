import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { IconSearch } from "@tabler/icons-react";
import { Kbd, KbdGroup } from "./ui/kbd";

export default function SearchBar() {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("open-command-menu"));
  };

  return (
    <InputGroup onClick={handleClick} className="cursor-pointer">
      <InputGroupInput placeholder="Search..." readOnly className="cursor-pointer" />
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
