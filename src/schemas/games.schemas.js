import joi from "joi";

export const gamesSchema = joi.object({
  name: joi.string().required(),
  image: joi.string().required(),
  stockTotal: joi.number().required().min(1),
  pricePerDay: joi.number().required().min(1),
});
