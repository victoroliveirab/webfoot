import { useContext } from "solid-js";
import { useNavigate } from "@solidjs/router";

import Dropdown, { DropdownOption } from "@webfoot/components/Dropdown";

import useFormationsOptions from "./useFormations";
import { LayoutContext } from "../../contexts/layout";
import type { OpenedDropdown } from "../../types";

const NavBar = () => {
  const navigate = useNavigate();
  const {
    handlers: {
      setModalBestScorersSeasonOpened,
      setModalCalendarTeamOpened,
      setModalStandingsOpened,
      setOpenedDropdown,
    },
    values: { openedDropdown },
  } = useContext(LayoutContext);

  const webfootDropdownOptions: DropdownOption[] = [
    {
      label: "Opções...",
      onClick: () => console.log("options"),
    },
    {
      label: "Sair",
      onClick: () => {
        window.localStorage.clear();
        navigate("/");
      },
    },
    {
      label: "Acerca...",
      onClick: () => {
        console.log("about");
      },
    },
  ];

  const formationDropdownOptions = useFormationsOptions();

  const teamOptions: DropdownOption[] = [
    {
      label: "Pedir / pagar empréstimo...",
      onClick: () => console.log("loan"),
    },
    {
      label: "Estádio...",
      onClick: () => console.log("stadium"),
    },
    {
      label: "Historial...",
      onClick: () => console.log("history"),
    },
  ];

  const playerOptions: DropdownOption[] = [
    {
      label: "Vender",
      onClick: () => console.log("sell"),
    },
    {
      label: "Jogadores sob observação...",
      onClick: () => console.log("wishlist"),
    },
    {
      label: "Procurar...",
      onClick: () => console.log("search"),
    },
    {
      divider: true,
    },
    {
      label: "Últimas transferências...",
      onClick: () => console.log("last transfers"),
    },
    {
      label: "Aquisições",
      onClick: () => console.log("acquisitions"),
    },
  ];

  const championshipOptions: DropdownOption[] = [
    {
      label: "Classificação...",
      shortcut: "C",
      onClick: () => setModalStandingsOpened(true),
    },
    {
      label: "Melhores marcadores...",
      onClick: () => setModalBestScorersSeasonOpened(true),
    },
    {
      label: "Calendário...",
      onClick: () => setModalCalendarTeamOpened(true),
    },
    {
      divider: true,
    },
    {
      label: "Últimos vencedores...",
      onClick: () => null,
    },
    {
      label: "Melhores marcadores de sempre...",
      onClick: () => null,
    },
  ];

  const trainerOptions: DropdownOption[] = [
    {
      label: "História...",
      onClick: () => console.log("history"),
    },
    {
      label: "Gestão de treinadores...",
      onClick: () => console.log("management"),
    },
    {
      label: "Ranking...",
      onClick: () => console.log("ranking"),
    },
    {
      divider: true,
    },
    {
      label: "Perfil...",
      onClick: () => console.log("profile"),
    },
  ];

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
      <Dropdown id="team" label="Equipa" options={teamOptions} {...dropdownProps("Team")} />
      <Dropdown id="player" label="Jogador" options={playerOptions} {...dropdownProps("Player")} />
      <Dropdown
        id="championship"
        label="Campeonato"
        options={championshipOptions}
        {...dropdownProps("Championship")}
      />
      <Dropdown
        id="trainer"
        label="Treinador"
        options={trainerOptions}
        {...dropdownProps("Trainer")}
      />
    </nav>
  );
};

export default NavBar;
