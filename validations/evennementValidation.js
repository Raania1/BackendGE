import vine ,{ errors } from "@vinejs/vine";
import { CustomErrorReporter } from "./customErrorReporter.js";

// * Custom Error Reporter
vine.errorReporter = () => new CustomErrorReporter();

export const validateEvennement = vine.object({
      nom: vine.string().minLength(3).maxLength(100).trim(),
      dateDebut: vine.date().transform((val) => new Date(val)),
      dateFin: vine.date().transform((val) => new Date(val)),
      lieu: vine.string().minLength(3).maxLength(200).trim(),
      organisateurid: vine.string().uuid(),
});
export const EventUpdate = vine.object({
    nom: vine.string().minLength(3).maxLength(100).trim().optional(), 
    dateDebut: vine.date().transform((val) => new Date(val)).optional(),
    dateFin: vine.date().transform((val) => new Date(val)).optional(),
    lieu: vine.string().minLength(3).maxLength(200).trim().optional(),
});