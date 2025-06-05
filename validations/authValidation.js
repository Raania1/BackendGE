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
export const updateOrganizerSchema = vine.object({
    nom: vine.string().minLength(2).maxLength(15).optional(),
    prenom: vine.string().minLength(2).maxLength(15).optional(),
    email: vine.string().email().optional(),
    numCin: vine.number().min(10000000).max(99999999).optional(),
    numTel: vine.number().min(10000000).max(99999999).optional(),
    adress: vine.string().minLength(5).maxLength(100).optional(),
    ville: vine.enum([
        "Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte", "Gabès", "Ariana", "Gafsa",
        "Monastir", "Nabeul", "Tataouine", "Béja", "Jendouba", "Médenine", "Mahdia",
        "Kasserine", "Kebili", "Siliana", "Le Kef", "Tozeur", "Zaghouan", "Manouba",
        "Ben Arous"
    ]).optional()
});

export const registerAdminSchema = vine.object({
    nom:vine.string().minLength(2).maxLength(15),
    prenom:vine.string().minLength(2).maxLength(15),
    email:vine.string().email(),
    password :vine.string().minLength(6).maxLength(100).confirmed(),
})
export const updateAdminSchema = vine.object({
    nom:vine.string().minLength(2).maxLength(15).optional(),
    prenom:vine.string().minLength(2).maxLength(15).optional(),
    email:vine.string().email().optional(),
})

export const registerPrestataireSchema = vine.object({
    nom:vine.string().minLength(2).maxLength(15),
    prenom:vine.string().minLength(2).maxLength(15),
    email:vine.string().email(),
    travail:vine.string().maxLength(50),
    description:vine.string(),
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
export const updatePrestataireSchema = vine.object({
    nom:vine.string().minLength(2).maxLength(15).optional(),
    prenom:vine.string().minLength(2).maxLength(15).optional(),
    email:vine.string().email().optional(),
    travail:vine.string().maxLength(50).optional(),
    description:vine.string().
    optional(),
    numCin: vine.number().min(10000000).max(99999999).optional(),
    numTel: vine.number().min(10000000).max(99999999).optional(),
    adress:vine.string().minLength(5).maxLength(100).optional(),
    ville:vine.enum([
        "Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte", "Gabès", "Ariana", "Gafsa",
        "Monastir", "Nabeul", "Tataouine", "Béja", "Jendouba", "Médenine", "Mahdia",
        "Kasserine", "Kebili", "Siliana", "Le Kef", "Tozeur", "Zaghouan", "Manouba",
        "Ben Arous"
    ]).optional()
})
export const loginSchema = vine.object({
    email:vine.string().email(),
    password :vine.string(),
})