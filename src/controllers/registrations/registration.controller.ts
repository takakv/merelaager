import { deleteShiftRegistrationFunc } from "./delete.registration";
import {
  fetchRegistrationFunc,
  fetchRegistrationsFunc,
  fetchShiftRegistrationsFunc,
} from "./fetch.registration";
import { fetchShiftRegistrationsPdfFunc } from "./pdf.registration";
import { patchRegistrationFunc } from "./patch.registration";
import { createRegistrationsFunc } from "./create.registration";

export const fetchRegistrations = fetchRegistrationsFunc;

export const createRegistrations = createRegistrationsFunc;

export const fetchRegistration = fetchRegistrationFunc;

export const fetchShiftRegistrations = fetchShiftRegistrationsFunc;

export const deleteShiftRegistration = deleteShiftRegistrationFunc;

export const patchRegistration = patchRegistrationFunc;

export const fetchShiftRegistrationPdf = fetchShiftRegistrationsPdfFunc;
