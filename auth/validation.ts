"use server";

import { cache } from "react";
import { getSession } from "./sessionManagement";

export const validateRequest = cache(getSession);