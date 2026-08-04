const API_URL = "https://script.google.com/macros/s/AKfycbyp0m2jku5l0MyGgCk0-ikDskG29puw_zO2C0uM7dcHL_aWMbCkNHMClSrTr0SoXk9gsw/exec";


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
