import vine from "@vinejs/vine";
import { CustomErrorReporter } from "./customErrorReporter.js";

// * Custom Error Reporter
vine.errorReporter = () => new CustomErrorReporter();

export const ServiceSchema = vine.object({
    nom: vine.string().minLength(2).maxLength(50).trim(), 
    description: vine.string().minLength(10).maxLength(1000).trim(),
    prix: vine.number().positive(),
    promo: vine.number().range(0, 100).optional(), 
    type: vine.string(),
    Photos: vine.array(vine.string().url()).optional(),
    Prestataireid: vine.string().uuid(),
    approoved: vine.boolean().optional()
});
export const ServiceUpdate = vine.object({
    nom: vine.string().minLength(2).maxLength(50).trim().optional(), 
    description: vine.string().minLength(10).maxLength(1000).trim().optional(),
    prix: vine.number().positive().optional(),
    promo: vine.number().range(0, 100).optional(), 
});