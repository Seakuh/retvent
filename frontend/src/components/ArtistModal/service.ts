import { API_URL } from "../../utils";

export const setUpNewArtist = async (
  artistname: string,
  image: File,
  description: string
) => {
  const formData = new FormData();
  formData.append("image", image);
  formData.append("name", artistname);
  formData.append("prompt", description);

  console.log(formData);

  const response = await fetch(`${API_URL}artists/new`, {
    method: "POST",
    body: formData,
  });
  return response.json();
};
