import { useContext } from "react";
import { ColorModeContext } from "../../contexts/color-mode";

export type TitleProps = { size: number };

export const TitleImg: React.FC<TitleProps> = ({ size }: TitleProps) => {
  const { mode } = useContext(ColorModeContext);

  const srcUrl: string =
    mode === "light"
      ? "https://static.stakestone.io/stone/logo/stone-icon.svg"
      : "https://static.stakestone.io/stone/logo/stone-icon-b.svg";

  return <img width={size} height={size} src={srcUrl} alt=""></img>;
};
