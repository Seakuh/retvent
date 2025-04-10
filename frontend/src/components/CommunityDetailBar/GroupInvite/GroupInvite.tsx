import { useParams } from "react-router-dom";

export const GroupInvite = () => {
  const { userId, tokenId } = useParams();
  return (
    <div>
      GroupInvite {userId} {tokenId}
    </div>
  );
};
