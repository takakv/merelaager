import {
  Body,
  Controller,
  Get,
  Request,
  Path,
  Post,
  Query,
  Route,
  SuccessResponse,
} from "tsoa";
import { RegistrationEntry } from "../Support Files/registrations";
import { RegistrationsService } from "./RegistrationsService";
import Entity = Express.Entity;
import express from "express";

@Route("registrations")
export class RegistrationsController extends Controller {
  @Get("")
  public async getRegistrations(
    @Request() req: express.Request
  ): Promise<RegistrationEntry[]> {
    console.log(req);
    return new RegistrationsService().getAll();
  }
}
