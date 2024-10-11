import { useContext } from "solid-js";
import { useNavigate } from "@solidjs/router";

import Dropdown, { DropdownOption } from "@webfoot/components/Dropdown";

import useFormationsOptions from "./useFormations";
import { LayoutContext } from "../../contexts/layout";
import type { OpenedDropdown } from "../../types";

const NavBar = () => {
  const navigate = useNavigate();
  const {
    handlers: { setOpenedDropdown },
    values: { openedDropdown },
  } = useContext(LayoutContext);

  const webfootDropdownOptions: DropdownOption[] = [
    {
      label: "Opções...",
      onClick: () => console.log("opçoes"),
    },
    {
      label: "Sair",
      onClick: () => {
        window.localStorage.removeItem("current-game");
        navigate("/");
      },
    },
    {
      label: "Acerca...",
      onClick: () => {
        console.log("sobre Victor...");
      },
    },
  ];

  const formationDropdownOptions = useFormationsOptions();

  function dropdownProps(value: OpenedDropdown) {
    return {
      show: () => openedDropdown() === value,
      onClick: () => setOpenedDropdown(value),
      onClose: () => {
        // Only the dropdown can manage its state
        if (value === openedDropdown()) setOpenedDropdown(null);
      },
    };
  }

  return (
    <nav class="flex bg-w3c-lightgray">
      <Dropdown
        id="webfoot"
        label="Webfoot"
        options={webfootDropdownOptions}
        {...dropdownProps("Webfoot")}
      />
      <Dropdown
        id="formation"
        label="Selecionar"
        options={formationDropdownOptions}
        {...dropdownProps("Formation")}
      />
    </nav>
  );
};

export default NavBar;
