const db = require("../ulit/db");
const bcrypt = require("bcrypt");


const setPassword = async (req, res) => {
    const {
        phone,
        Password,
        ConfirmPassword
    } = req.body;
    // console.log("Phone:", phone);
    // const user = await checkExistUser(phone);
    // console.log("User:", user); // Log the result of checkExistUser
    // res.json({ message: "Test" }); // Placeholder response
    var message = {}
    if (phone == null || phone == "") {
        message.phone = "Tel required"
    }
    if (Password == null || Password == "") {
        message.Password = "Password required"
    }
    else {
        if (Password != ConfirmPassword) {
            message.Password = "Pasword not match"
        }
    }


    if (Object.keys(message).length > 0) {
        res.json({
            message: message
        })
        return 0;
    }
    const user = await checkExistUser(phone);
    console.log(phone)
    if (!user) {
        res.json({
            message: "User does not exist.",
        })
    } else {
        
            // bcrypt : hash password (123434=>sdfajo94u5o34up03452809453)
            const hashPassword = await bcrypt.hashSync(Password,10)
            var sql = "UPDATE employee SET Password = ? WHERE phone= ?";
            const data = await db.query(sql,[hashPassword,phone]);
            // delete user.Password
            res.json({
                message : data.affectedRows ? "Passsword set success!" : "Something wrong!",
                profile : user
            }) 
        

    }

}


const checkExistUser = async (phone) =>{
    const user = await db.query("SELECT * FROM employee WHERE phone = ?", [phone])
    if (user){
        // delete user[0].Password
       return user[0]

    }
    else{
       return false
    }
}

const login = async (req,res) => {
    const {
        phone,Password
    } = req.body;
    var message = {}; // empty object
    if(phone == null || phone == ""){
        message.phone = "Please input username!"
    }
    if(Password == null || Password == ""){
        message.Password = "Please input password!"
    }
    if(Object.keys(message).length > 0){
        res.json({
            message : message
        })
        return false
    }
    try {
        const user = await checkExistUser(phone);
        if (!user) {
            return res.json({ message: "User does not exist." });
        }

        // Hash the password
        const hashPassword = await bcrypt.hashSync(Password, 10);

        // Update the user's password in the database
        const updateResult = await db.query("UPDATE employee SET Password = ? WHERE phone = ?", [hashPassword, phone]);

        if (updateResult.affectedRows > 0) {
            // Password successfully updated
            // delete user.Password; // Remove password from user object before sending response
            return res.json({
                message: "Password set successfully.",
                profile: user
            });
        } else {
            // Password update failed
            return res.json({ message: "Failed to set password." });
        }
    } catch (error) {
        console.error("Error setting password:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}


const getOne = (req, res) => {
    var { emp_id } = req.body;
    var sqlSelect = " SELECT * FROM employee WHERE emp_id = ? "
    if (user && user.length)
        //    const getParam = emp_id
        db.query(sqlSelect, [emp_id], (error, rows) => {
            if (!error) {
                res.json({
                    data: rows
                    //message :(rows.affectedRows != 0 ? "Employee found" : "Employee not found")
                })
            }
            else {
                res.json({
                    error: true,
                    message: error
                })
            }

        })

}
const getAll = (req, res) => {
    const { textSearch } = req.query;
    var sqlSelect = " SELECT * FROM employee "
    if (textSearch != null && textSearch != "") {
        sqlSelect += " WHERE emp_name LIKE '%" + textSearch + "%' OR phone LIKE '%" + textSearch + "%'"
    }
    db.query(sqlSelect, (error, rows) => {
        if (!error) {
            res.json({
                data: rows
            })
        }
        else {
            res.json({
                error: true,
                message: error
            })
        }

    })
}
// const create = (req, res) => {
//   var{

//     emp_name,
//     gender,
//     role,
//     address,
//     phone,

//   }= req.body

//   const sqlInsert ="INSERT INTO employee(emp_name, gender, role, address, phone ) VALUE(?, ?, ?, ?, ?)"
//   const empParam = [emp_name, gender, role, address, phone]
//   db.query(sqlInsert, empParam, (error, rows)=>{
//     if(!error){
//         res.json({
//         message:"Insert successfully",
//         data:rows,
//         employee_info:{
//         emp_name,
//         gender,
//         role,
//         address,
//         phone
//     }
// })

//     }
//     else{
//         res.json({
//         error:true,
//         message:error 
//         })
//     }
//   })
// }

const create = (req, res) => {
    var {

        emp_name,
        gender,
        role,
        address,
        phone,

    } = req.body
    // var filename = null
    // if (req.file) {
    //     filename = req.file.filename
    // }
    var sql = "INSERT INTO employee (emp_name, gender,role,address,phone) VALUE(?, ?, ?, ?, ?)"
    var param = [emp_name, gender, role, address, phone];
    db.query(sql, param, (error, rows) => {
        if (!error) {
            res.json({
                message: (rows.affectedRows != 0 ? "Insert success!" : "Something wrong!"),
                data: rows
            })
        } else {
            res.json({
                error: true,
                message: error
            })
        }
    })
}

const update = (req, res) => {
    var {
        emp_id,
        emp_name,
        gender,
        role,
        address,
        phone,

    } = req.body

    var sqlUpdate = "UPDATE employee SET emp_name=?, gender=?, role=?, address=?, phone=? WHERE emp_id=?"
    var param = [emp_name, gender, role, address, phone, emp_id]

    db.query(sqlUpdate, param, (error, rows) => {
        if (!error) {
            res.json({
                message: "Update successfully.",
                list: rows,
                result: {
                    emp_id,
                    emp_name,
                    gender,
                    role,
                    address,
                    phone,

                }
            })
        } else {
            res.json({
                error: true,
                message: error
            })
        }
    })
}
const remove = (req, res) => {
    var { emp_id } = req.params
    var sqlDelete = " DELETE FROM employee WHERE emp_id=?"
    db.query(sqlDelete, emp_id, (error, rows) => {
        if (!error) {
            res.json({
                message: (rows.affectedRows == 1 ? "Delete successfully" : "Can not delete")
            })


        } else {
            res.json({
                error: true,
                message: error
            })
        }
    })
}
module.exports = {
    getOne,
    getAll,
    create,
    update,
    remove,
    setPassword,
    login
}