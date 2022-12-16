const db = require("../_helpers/_db");
const maxID = require("../_helpers/_maxid");

async  function uploadDataFile(req, next) {
    try {
        let files = req.files;
        return next({ status: true, message: "Contact details found!" });
    } catch (error) {
        return next({ status: false, message: "Something went wrong", error: error });
    }
}

async  function getContactList(req, next) {
    try {
        let sql = `SELECT * FROM contact;`;
        let result = await db.query(sql);
        return (result.rowCount > 0) ? next({ status: true, message: "Contact details found!", data: result.rows }) : next({ status: true, message: "Data not found!" });
    } catch (error) {
        return next({ status: false, message: "Something went wrong", error: error });
    }
}

async  function getContactData(id, req, next) {
    try {
        let sql = `SELECT * FROM contact WHERE contact_id = ${id};`;
        let result = await db.query(sql);
        return (result.rowCount > 0) ? next({ status: true, message: "Contact details found!", data: result.rows }) : next({ status: true, message: "Data not found!" });
    } catch (error) {
        return next({ status: false, message: "Something went wrong", error: error });
    }
}

async function createContactData(req, next) {
    try {
        let body = req.body;
        let maxId = await maxID.maxID('contact');
        let keys = Object.keys(body);
        var i = {};
        keys.forEach(element => {
            if(body[element]) {
                i[element] = body[element];
            }
        });
        keys = Object.keys(i);
        keys = keys.map(item => item.toLowerCase());
        let data = Object.values(i);
        data = data.map(item => {
            if(typeof item == 'number') {
                return item;
            } else {
                return `'${item}'`;
            }
        });
        let sql = `INSERT INTO contact (contact_id, ${keys}) VALUES (${maxId}, ${data});`;
        console.log(sql);
        let result = await db.query(sql);
        return (result.rowCount > 0) ? next({ status: true, message: "Contact saved!" }) : next({ status: false, message: "Contact does not save!" });
    } catch (error) {
        return next({ status: false, message: "Something went wrong", error: error });
    }
}

module.exports = { getContactData, createContactData, getContactList, uploadDataFile };