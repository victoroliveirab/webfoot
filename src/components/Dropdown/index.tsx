import { type Accessor, For, Show, onCleanup, onMount } from "solid-js";
import { Portal } from "solid-js/web";

export type DropdownOption =
  | {
      disabled?: boolean;
      divider?: never;
      keepOpenedOnClick?: boolean;
      label: string;
      onClick: () => void;
      shortcut?: string;
    }
  | {
      disabled?: never;
      divider: true;
      keepOpenedOnClick?: never;
      label?: never;
      onClick?: never;
      shortcut?: never;
    };

type Props = {
  id: string;
  label: string;
  onClick: () => void;
  onClose: () => void;
  options: DropdownOption[] | Accessor<DropdownOption[]>;
  show: Accessor<boolean>;
};

const Dropdown = ({ id, label, onClick, onClose, options, show }: Props) => {
  let ref: HTMLDivElement;

  function handleClick(event: MouseEvent) {
    if (!ref.contains(event.target as HTMLElement)) {
      onClose();
    }
  }

  onMount(() => {
    document.addEventListener("click", handleClick, { passive: true });
  });

  onCleanup(() => {
    document.removeEventListener("click", handleClick);
  });

  return (
    <div class="relative" id={id} ref={ref!}>
      <span
        onClick={onClick}
        class={`inline-block h-full px-2 cursor-default select-none ${show() ? "bg-w3c-lightskyblue text-white" : ""}`}
      >
        {label}
      </span>
      <Show when={show()}>
        <Portal mount={document.getElementById(id)!}>
          <ul
            class="absolute top-full left-0 flex flex-col bg-w3c-lightgray text-sm z-50"
            style={{
              "box-shadow": "5px 5px 10px 0px rgba(0,0,0,0.6)",
            }}
          >
            <For each={Array.isArray(options) ? options : options()}>
              {(option) => (
                <li class="py-1 px-1">
                  {option.divider ? (
                    <hr />
                  ) : (
                    <button
                      class="inline-flex items-start w-full gap-2 px-6 text-nowrap cursor-pointer outline-none hover:bg-w3c-lightsteelblue disabled:text-w3c-gray disabled:hover:bg-transparent"
                      disabled={!!option.disabled}
                      onClick={() => {
                        option.onClick();
                        !option.keepOpenedOnClick && onClose();
                      }}
                    >
                      <span class="flex-1 text-left">{option.label}</span>
                      {option.shortcut && <span class="w-6 text-left">{option.shortcut}</span>}
                    </button>
                  )}
                </li>
              )}
            </For>
          </ul>
        </Portal>
      </Show>
    </div>
  );
};

export default Dropdown;
