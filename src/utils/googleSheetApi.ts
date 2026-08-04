const API_URL = "https://script.google.com/macros/s/AKfycby8B12YA1O4OE0KaaBqnbKzOO0iDcqG90ik2PTJyO4_N261i0GMxuxhfl609ERmNiNNYw/exec";


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


export async function createReservation(reservation:any){

  const response = await fetch(API_URL,{
    method:"POST",
    body:JSON.stringify(reservation)
  });


  return await response.json();

}
