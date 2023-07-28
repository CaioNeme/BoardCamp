import joi from "joi";

export const customersSchema = joi.object({
  name: joi.string().required(),
  phone: joi
    .string()
    .min(10)
    .max(11)
    .pattern(/^[0-9]{10,11}$/)
    .required(),
  cpf: joi
    .string()
    .trim()
    .pattern(/^[0-9]+$/)
    .length(11)
    .required(),
  birthday: joi.date().required(),
});
