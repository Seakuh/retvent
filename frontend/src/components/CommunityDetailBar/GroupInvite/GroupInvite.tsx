import { useParams } from "react-router-dom";

export const GroupInvite = () => {
  const { tokenId } = useParams();
  return <div>GroupInvite {tokenId}</div>;
};
