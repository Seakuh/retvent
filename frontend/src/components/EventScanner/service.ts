export const uploadEventImage = async (image: File, lat?: number, lon?: number) => {
    const formData = new FormData();
    formData.append('imageUrl', image);
    if (lat && lon) {
      formData.append('lat', lat.toString());
      formData.append('lon', lon.toString());
    }
  
    const response = await fetch('http://localhost:3000/events/upload', {
      method: 'POST',
      body: formData,
    });
  
    return response.json();
  };
  