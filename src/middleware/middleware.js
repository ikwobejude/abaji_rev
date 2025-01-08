const jwt = require("jsonwebtoken");
const { Sequelize, QueryTypes } = require("sequelize");
const db = require('../db/connection')
const Users = require('../model/Users');
const clientService = require("../model/Client");
const Op = Sequelize.Op;


class AuthMiddleware {

    static async getClientDetails(serviceId) {
        try {
            return await clientService.findOne({
                attributes: ['client', 'service_id', 'service_logo', 'service_status'],
                where: { service_id: serviceId },
                raw: true
            });
        } catch (error) {
            console.error("Error fetching client details:", error);
            throw new Error("Unable to fetch client details.");
        }
    }
    
    static requireAuth = async (req, res, next) => {
        try {
            const token = req.cookies.jwt;
    
            if (!token) {
                req.flash("danger", "You're not logged in! Please login to get access");
                return res.redirect('/login');
            }
    
            const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
    
            if (!decodedToken.userId) {
                throw new Error("Your session has expired. Please login and continue.");
            }
    
            const user = await db.query(
                `
                SELECT 
                    users.id,
                    users.group_id,
                    g.group_name,
                    users.username,
                    users.email,
                    users.surname,
                    users.firstname,
                    users.user_phone,
                    users.service_id,
                    users.service_code,
                    users.inactive,
                    users.name,
                    users.user_code,
                    users.permissions
                FROM users 
                INNER JOIN user_groups AS g ON g.group_id = users.group_id
                WHERE users.id = :userId LIMIT 1
                `,
                {
                    replacements: { userId: decodedToken.userId },
                    type: QueryTypes.SELECT
                }
            );
    
            if (!user || user.length === 0) {
                req.flash("danger", "The User with the ID doesn't exist");
                return res.redirect('/login');
            }
    
            if (user[0].inactive == 2) {
                req.flash("danger", "Your account has been deactivated, contact admin for more detail");
                return res.redirect('/login');
            }
    
            const client = await this.getClientDetails(user[0]?.service_id); // `this` works correctly now.
            res.locals.user = { ...user[0], ...client };
            req.user = { ...user[0], ...client };
    
            next();
        } catch (error) {
            console.error("Authentication error:", error);
            req.flash("danger", error.message);
            return res.redirect('/login');
        }
    };
    
    
    static async checkUser(req, res, next) {
        // console.log(req.cookies.jwt)
        // return
        const token = req.cookies.jwt;
        // console.log(token)
        if (token) {
            jwt.verify(token, process.env.JWT_SECRET, async(err, decodedToken) => {
                // console.log(decodedToken.userId)
              
                if (err) {
                    console.log(err.message)
                    res.locals.user = null;
                    next();
                } else {
                    // console.log(decodedToken);
                    let user = await Users.findOne({
                        attributes:["id", 'group_id', "username", "email","surname", "firstname", "middlename", "user_phone", "service_id", "service_code", 'name' , 'tax_office_id', 'category_id', 'lga_id', 'is_supervisor'], 
                        where: { id: decodedToken.userId }, 
                        raw:true, 
                        cache: true 
                    })
                    // let wallet = await Wallet.findOne({where: {userId: decodedToken.userId}})
                    // console.log(user)
                    res.locals.user = user;
                    req.user = user;
                    next()
                }
               
            })
        } else {
            res.locals.user = null;
            next()
        }
    }

    static async checkChangePassword(req, res, next) {
        if(req.user.inactive == 0 ){
            req.flash("Please change reset your password");
            res.redirect('/user/change_password')
        } else {
            next()
        }
    
    }


    static async mobileMiddleware(req, res, next) {
        try {
            if(!req.headers.authorization) throw Error('Invalid authorization token');
    
            const token = req.headers.authorization.split(" ")[1];
            if (token) {
                jwt.verify(token, process.env.JWT_SECRET, async(err, decodedToken) => {
                    if (err) {
                        res.status(401).json({
                            status: "error",
                            message: err.message
                        })
                    } else {
                        let user = await Users.findOne({
                            attributes:["id", 'group_id', "username", "email","surname", "firstname", "middlename", "user_phone", "service_id", "service_code", 'name' , 'tax_office_id', 'lga_id', 'is_supervisor', 'category_id'],
                            where:{id: decodedToken.userId},
                            raw: true
                        })
                        req.user = user;
                        next()
                    }
                })
            } else {
                res.status(401).json({
                    status: "error",
                    message: "authorization token not found!"
                })
            }  
    
    
        } catch (error) {
            // console.log(error.stack)
            res.status(401).json({
                status: "error",
                message: "Unknown error",
                data: error.message
            })
        }
       
    }

}



module.exports = AuthMiddleware


// chck current user
