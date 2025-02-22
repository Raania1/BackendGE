import vine from "@vinejs/vine";
import { CustomErrorReporter } from "./customErrorReporter.js";

// * Custom Error Reporter
vine.errorReporter = () => new CustomErrorReporter();

export const registerOrganizerSchema = vine.object({
    nom:vine.string().minLength(2).maxLength(15),
    prenom:vine.string().minLength(2).maxLength(15),
    email:vine.string().email(),
    password :vine.string().minLength(6).maxLength(100).confirmed(),
    numCin: vine.number().min(10000000).max(99999999),
    numTel: vine.number().min(10000000).max(99999999),
    adress:vine.string().minLength(5).maxLength(100),
    ville:vine.enum([
        "Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte", "Gabès", "Ariana", "Gafsa",
        "Monastir", "Nabeul", "Tataouine", "Béja", "Jendouba", "Médenine", "Mahdia",
        "Kasserine", "Kebili", "Siliana", "Le Kef", "Tozeur", "Zaghouan", "Manouba",
        "Ben Arous"
    ])

})
export const registerAdminSchema = vine.object({
    nom:vine.string().minLength(2).maxLength(15),
    prenom:vine.string().minLength(2).maxLength(15),
    email:vine.string().email(),
    password :vine.string().minLength(6).maxLength(100).confirmed(),
})
export const registerPrestataireSchema = vine.object({
    nom:vine.string().minLength(2).maxLength(15),
    prenom:vine.string().minLength(2).maxLength(15),
    email:vine.string().email(),
    travail:vine.string().maxLength(50),
    description:vine.string().maxLength(255),
    password :vine.string().minLength(6).maxLength(100).confirmed(),
    numCin: vine.number().min(10000000).max(99999999),
    numTel: vine.number().min(10000000).max(99999999),
    adress:vine.string().minLength(5).maxLength(100),
    ville:vine.enum([
        "Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte", "Gabès", "Ariana", "Gafsa",
        "Monastir", "Nabeul", "Tataouine", "Béja", "Jendouba", "Médenine", "Mahdia",
        "Kasserine", "Kebili", "Siliana", "Le Kef", "Tozeur", "Zaghouan", "Manouba",
        "Ben Arous"
    ])
})
export const loginSchema = vine.object({
    email:vine.string().email(),
    password :vine.string(),
})