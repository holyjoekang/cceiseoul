const API_URL = "https://script.google.com/macros/s/AKfycbxKyiN5TAI8l59yqGLoZfVTdQZ8Ty_lCdII9U6MlGGDZJbrH1zNqahYWMn3M3WzkdMHUQ/exec";


export async function getReservations() {

  const response = await fetch(API_URL);

  const data = await response.json();

  return data;

}


export async function createReservation(reservation:any){

  const response = await fetch(API_URL,{
    method:"POST",
    body:JSON.stringify(reservation)
  });


  return await response.json();

}
