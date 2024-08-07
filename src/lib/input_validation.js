const Joi = require("joi");

module.exports = {

    login: Joi.object({
        username: Joi.string().required().messages({
            "any.required": `Username is required`,
            "string.empty": `Username cannot be empty`,
        }),
        password: Joi.string().required().messages({
            "any.required": `Password is required`,
            "string.empty": `Password cannot be empty`,
        }),
    }),


    changePassVal: Joi.object({
        old_password: Joi.string().required().messages({
            "any.required": `Old password is required`,
            "string.empty": `Old password cannot be empty`,
        }),
        password: Joi.string().required().messages({
            "any.required": `Password is required`,
            "string.empty": `Password cannot be empty`,
        }),
        confirm_password: Joi.ref('password'),
      }),

      validateTickets: Joi.object({
        ticket_type: Joi.string().required().messages({
          "any.required": `Ticket is required`,
          "string.empty": `Ticket cannot be empty`,
        }),
        ward: Joi.string().allow("").optional(),
        number_of_ticket: Joi.number().required().messages({
          "any.required": `Number of ticket is required`,
          "string.empty": `Number of ticket cannot be empty`,
        }),
      })
}