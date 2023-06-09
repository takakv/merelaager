import { deleteShiftRegistrationFunc } from "./delete.registration";
import {
  fetchRegistrationsFunc,
  fetchShiftRegistrationsFunc,
} from "./fetch.registration";

export const fetchRegistrations = fetchRegistrationsFunc;

export const fetchShiftRegistrations = fetchShiftRegistrationsFunc;

export const deleteShiftRegistration = deleteShiftRegistrationFunc;
