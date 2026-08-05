const API_URL = "https://script.google.com/macros/s/AKfycbz6hTF8MvxCcoyFqrDwwoe6fZu18sP4gLxu_aBXDizWpz5lAUfVfQQIneIePrTl-57g8w/exec";

export async function getReservations() {
  const response = await fetch(API_URL);
  const data = await response.json();
  return data;
}

export async function createReservation(reservation: any) {
  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "create",
      reservation: reservation,
    }),
  });
  return await response.json();
}
