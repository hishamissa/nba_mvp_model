import { cn } from "../../lib/utils";

export function Marquee({
  className,
  reverse,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}) {
  return (
    <div
      {...props}
      className={cn(
        "mq-container",
        {
          "mq-vertical": vertical,
          "mq-horizontal": !vertical,
        },
        className
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn("mq-track", {
              "animate-marquee": !vertical,
              "animate-marquee-vertical": vertical,
              "mq-paused": pauseOnHover,
              "mq-reverse": reverse,
            })}
          >
            {children}
          </div>
        ))}
    </div>
  );
}
