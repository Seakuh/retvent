import { useEffect, useState } from "react";
import { Community } from "../../utils";
import { getCommunity } from "./service";

export const CommunityPage = () => {
  const communityId = "useParams()";
  const [community, setCommunity] = useState<Community | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchCommunity = async () => {
      const response = await getCommunity("communityId as string");
      if (!response) {
        setNotFound(true);
      }
      setCommunity(response);
      setIsLoading(false);
    };
    void fetchCommunity();
  }, [communityId]);

  if (isLoading) {
    return <div>Community wird geladen …</div>;
  }

  if (notFound || !community) {
    return <div>Community nicht gefunden.</div>;
  }

  return <div>CommunityPage</div>;
};
