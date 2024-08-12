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
    }),

    validateItem: Joi.object({
      revenue_line: Joi.string().required().messages({
        "any.required": `Revenue line is required`,
        "string.empty": `Revenue line cannot be empty`,
      }),
      timeline: Joi.string().required().messages({
        "any.required": `Timeline is required`,
        "string.empty": `Timeline cannot be empty`,
      }),
      name: Joi.string().required().messages({
        "any.required": `Revenue item name is required`,
        "string.empty": `Revenue item name cannot be empty`,
      }),
      Amount: Joi.number().required().messages({
        "any.required": `Amount is required`,
        "string.empty": `Amount cannot be empty`,
      }),
    }),

    validateUserGrpp: Joi.object({
      group_id: Joi.string().required().messages({
        "any.required": `Group Code is required`,
        "string.empty": `Group Code is cannot be empty`,
      }),
      group_name: Joi.string().required().messages({
        "any.required": `Group name required`,
        "string.empty": `Group name cannot be empty`,
      })
      
    })
}