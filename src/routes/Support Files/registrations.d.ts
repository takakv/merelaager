export interface RegistrationEntry {
  id: number,
  name: string,
  gender: string,
  dob: Date,
  old: boolean,
  shiftNr: number,
  shirtSize: string,
  order: number,
  registered: boolean,
  billNr?: number,
  contactName?: string,
  contactEmail?: string,
  contactPhone?: string,
  pricePaid?: number,
  priceToPay?: number,
  idCode?: string
}

export interface PrintEntry {
  name: string,
  gender: string,
  dob: Date,
  old: boolean,
  shirtSize: string,
  contactName: string,
  contactEmail: string,
  contactNumber: string,
}