import type { Accessor, ParentProps } from "solid-js";
import { Portal, Show } from "solid-js/web";

type Props = ParentProps<{
  class?: string;
  show: Accessor<unknown>;
}>;

const Modal = (props: Props) => {
  return (
    <Portal>
      <Show when={!!props.show()}>
        <div class={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${props.class}`}>
          {props.children}
        </div>
      </Show>
    </Portal>
  );
};

export default Modal;
