import { deleteShiftRegistrationFunc } from "./delete.registration";
import {
  fetchRegistrationFunc,
  fetchRegistrationsFunc,
  fetchShiftRegistrationsFunc,
} from "./fetch.registration";

export const fetchRegistrations = fetchRegistrationsFunc;

export const fetchRegistration = fetchRegistrationFunc;

export const fetchShiftRegistrations = fetchShiftRegistrationsFunc;

export const deleteShiftRegistration = deleteShiftRegistrationFunc;
