const API_URL = "여기에 Apps Script URL 입력";


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
