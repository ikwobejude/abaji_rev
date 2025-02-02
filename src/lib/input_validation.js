const Joi = require("joi");

module.exports = {

  clientServiceSchema: Joi.object({
    client_name: Joi.string().required().messages({
      "any.required": `Client is required`,
      "string.empty": `Client cannot be empty`,
    }),
    client_phone: Joi.string().required().messages({
      "any.required": `Client phone number is required`,
      "string.empty": `Client phone number cannot be empty`,
    }),
    client_email: Joi.string().required().messages({
      "any.required": `Client email is required`,
      "string.empty": `Client email cannot be empty`,
    }),
    admin_surname: Joi.string().required().messages({
      "any.required": `Admin surname is required`,
      "string.empty": `Admin surname cannot be empty`,
    }),
    admin_first_name: Joi.string().required().messages({
      "any.required": `Admin firstname is required`,
      "string.empty": `Admin firstname cannot be empty`,
    }),
    admin_middlename: Joi.string().allow("").optional(),
    client_admin_phone: Joi.string().required().messages({
      "any.required": `Client admin phone is required`,
      "string.empty": `Client admin phone cannot be empty`,
    }),
    client_admin_email: Joi.string().required().messages({
      "any.required": `Client admin email is required`,
      "string.empty": `Client admin email cannot be empty`,
    }),
    client_address: Joi.string().allow("").optional(),
  }).unknown(),
  

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
      user_role: Joi.string().required().messages({
        "any.required": `User role required`,
        "string.empty": `User role cannot be empty`,
      })
      
    }).unknown(),

    walletToitValidation: Joi.object({
      email: Joi.string().email().required().messages({
        "any.required": `Email is required`,
        "string.empty": `Email cannot be empty`,
        "string.email": `Email must be a valid email`,
      }),
      owner_name: Joi.string().required().messages({
        "any.required": `Name is required.`,
        "string.empty": `Name  cannot be empty.`,
      }),
      userId: Joi.string().required().messages({
        "any.required": `UserId is required.`,
        "string.empty": `UserId cannot be empty.`,
      }),
      owner_mobile_no: Joi.number().allow("").optional(),
      amount : Joi.number().required().messages({
        "any.required": `Amount is required.`,
        "string.empty": `Amount cannot be empty.`,
      }),
    }).unknown(),
    

    permissions: Joi.object({
      permission: Joi.string().required().messages({
        "any.required": `Permission is required`,
        "string.empty": `Permission cannot be empty`,
      })
    }).unknown()
    
}