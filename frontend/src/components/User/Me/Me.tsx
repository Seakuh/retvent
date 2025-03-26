import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Profile } from "../../../utils";
import { meService } from "./service";
export const Me: React.FC = () => {
  const { id } = useParams();
  const [me, setMe] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchMe = async () => {
      const me = await meService.getMe(id);
      setMe(me);
    };
    fetchMe();
  }, []);

  return (
    <div>
      <h1>Me</h1>
    </div>
  );
};
