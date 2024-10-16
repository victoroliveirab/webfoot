type Props = {
  morale: number;
  thin?: boolean;
};

export default function MoraleProgressBar({ morale, thin = false }: Props) {
  const width = `${100 * morale}%`;
  const bgColor = morale < 0.3 ? "red" : morale < 0.7 ? "yellow" : "limegreen";

  return (
    <div style={{ width: "calc(100% - 2 * 2px)" }}>
      <div>
        <div
          class={`w-full ${thin ? "h-4" : "h-6"} relative bg-w3c-lightgray`}
          style={{
            "box-shadow":
              "-2px -2px #e0dede, -2px 0 #e0dede, 0 -2px #e0dede, -4px -4px white, -4px 0 white, 0 -4px white, 2px 2px #818181, 0 2px #818181, 2px 0 #818181,  2px -2px #e0dede, -2px 2px #818181, -4px 2px white, -4px 4px black, 4px 4px black, 4px 0 black, 0 4px black, 2px -4px white, 4px -4px black",
            rotate: "180deg",
          }}
        >
          <div
            class={`absolute ${thin ? "top-px bottom-px" : "top-1 bottom-1"} right-1`}
            style={{ width, "background-color": bgColor }}
          />
        </div>
      </div>
    </div>
  );
}
