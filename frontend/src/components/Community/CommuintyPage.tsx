import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Community } from "../../utils";
import { getCommunity } from "./service";
export const CommunityPage = () => {
  const { communityId } = useParams();
  const [community, setCommunity] = useState<Community | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchCommunity = async () => {
      const community = await getCommunity(communityId as string);
      setCommunity(community);
    };
    fetchCommunity();
  }, [communityId]);

  return <div>CommunityPage</div>;
};
