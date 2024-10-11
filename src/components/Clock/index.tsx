import type { Accessor } from "solid-js";

type Props = {
  radius: number;
  time: Accessor<number>;
};

function getColor(time: number) {
  if (time <= 35) {
    return "blue";
  }
  if (time <= 45) {
    return "red";
  }
  if (time <= 80) {
    return "purple";
  }
  return "red";
}

export default function Clock({ radius, time }: Props) {
  const color = () => getColor(time());
  const trueTime = () => (time() + 1) % 46;
  const percentage = () => (100 / 60) * trueTime();
  const angle = () => (percentage() / 100) * 2 * Math.PI;

  const x2 = () => radius + radius * Math.sin(angle());
  const y2 = () => radius - radius * Math.cos(angle());

  const largeArcFlag = () => (percentage() > 50 ? 1 : 0);
  const pathData = () =>
    [
      `M ${radius} ${radius}`, // Move to center
      `L ${radius} 0`, // Line to start point (12 o'clock)
      `A ${radius} ${radius} 0 ${largeArcFlag()} 1 ${x2()} ${y2()}`, // Arc to end point
      `Z`, // Close the path
    ].join(" ");

  return (
    <svg width={2 * radius} height={2 * radius}>
      <circle cx={radius} cy={radius} r={radius} fill="lightgray" stroke="black" stroke-width="1" />
      <path d={pathData()} fill={color()} />
    </svg>
  );
}
