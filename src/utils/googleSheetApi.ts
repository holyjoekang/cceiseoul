const API_URL = "https://script.google.com/macros/s/AKfycbzgW41cCxL9yrCnI4fQWilN9c5iW9zoLH7k4o2l2MxhnK1XP5JFoxoE997YlF6VeaCcng/exec";

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

export async function updateReservationStatus(
  reservationId: string,
  status: string,
  rejectionReason?: string
) {
  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "updateStatus",
      reservationId,
      status,
      rejectionReason: rejectionReason || "",
    }),
  });
  return await response.json();
}
