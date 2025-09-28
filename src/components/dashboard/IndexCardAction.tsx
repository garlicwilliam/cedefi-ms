import { useLink } from "@refinedev/core";
import { BarsOutlined } from "@ant-design/icons";

export type IndexCardActionProps = {
  route: string;
  text: string;
};

export const IndexCardAction = ({ route, text }: IndexCardActionProps) => {
  const Link = useLink();

  return (
    <Link to={route}>
      <BarsOutlined /> {text}
    </Link>
  );
};
