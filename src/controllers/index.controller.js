const { Pool } = require('pg');
const createHash = require('hash-generator');
const path = require('path');
const { compileFunction } = require('vm');
const { Hash } = require('crypto');

const hashLength = 24;

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: '12345',
    database: 'api',
    port: '5432'
});

// USERS RELATED
const registerUser =  (req, res) =>{
        const { name, lastName, username, password, role } = req.body;
        const hash = createHash(hashLength);
        
        pool.query('SELECT * FROM users WHERE username = $1', [username])
        .then((response)=>{
            if( [...response.rows] == ''){
                pool.query(
                    'INSERT INTO users (name, lastname, username, password, role, hash) VALUES ($1, $2, $3, $4, $5, $6)', [
                        name, 
                        lastName, 
                        username, 
                        password, 
                        role, 
                        hash
                    ])
                    .then((added)=>{
                        res.status(200).end('USER CREATED.');
                    })
                    .catch((err)=>{
                        err.status(500).send({
                            error: 'CONNECTION ERROR'
                        });
                    }) 
            }else{
                res.status(502).send({
                    error: 'USER ALREADY REGISTERED'
                });
            }
        })
        .catch((err)=>{
            err.status(500).send({
                error: 'CONNECTION ERROR'
            });
        });
}

const login =  (req, res)=>{
    const { username, password } = req.body;
    pool
    .query(`SELECT * FROM users WHERE username = $1 AND password = $2`, [
        username, 
        password
    ]).then((response)=>{
        if(response.rowCount !== 0){
            res.status(200).send({ user: response.rows[0] })
        }else{
            res.status(500).send({error: 'CAN NOT FIND USER'})
        }
    }).catch((err)=>{
        res.status(500).send({error: 'CAN NOT FIND USER'})
    })
}

const getUser = (req, res)=>{
    const { token } = req.body;
    pool.query(`SELECT * FROM users WHERE hash = $1`, [
        token
    ]).then((response)=>{
        res.status(200).send({ user: response.rows[0] })
    }).catch((err)=>{
        res.status(500).send({error: 'CAN NOT FIND USER'})
    })
}

const updateWishlist = (req, res)=>{
    const { userHash } = req.body
    const { newWishlist } = req.body

    pool.query(`UPDATE users SET wishlist = $1 WHERE hash = $2`, [
        newWishlist,
        userHash
    ]).then((response)=>{
        pool.query(`SELECT * FROM users WHERE hash = $1`, [
            userHash
        ]).then((response)=>{
            const { name, lastname, username, role, hash, apps, wishlist } = response.rows[0]
            if(wishlist)
            res.status(200).send({
                name: name,
                lastName: lastname,
                username: username,
                role: role,
                hash: hash,
                apps: apps,
                wishlist: wishlist
            })
        }).catch((err)=>{
            res.status(500).send({error: 'CAN NOT FIND USER'})
        })
    }).catch((err)=>{
        res.status(500).send({error: "Can't find user"})
    })
}


const updateUserApps = (req, res)=>{
    const { userHash } = req.body
    const { newUserApps } = req.body
    pool.query(`UPDATE users SET apps = $1 WHERE hash = $2`, [
        newUserApps,
        userHash
    ]).then((response)=>{
        pool.query(`SELECT * FROM users WHERE hash = $1`, [
            userHash
        ]).then((response)=>{
            const { name, lastname, username, role, hash, apps, wishlist } = response.rows[0]
            res.status(200).send({
                name: name,
                lastName: lastname,
                username: username,
                role: role,
                hash: hash,
                apps: apps,
                wishlist: wishlist
            })
        }).catch((err)=>{
            res.status(500).send({error: 'CAN NOT FIND USER'})
        })
    }).catch((err)=>{
        res.status(500).send({error: "Can't find user"})
    })
}



// APPS RELATED
const registerApp = (req, res)=>{
    if(req.fileValidationError) {
        return res.status(500).end(req.fileValidationError);
    }
    const apphash = createHash(hashLength);
    const { userHash, category, appName, price, description, date } = req.body;
    const photo = req.file.filename
    pool.query('SELECT * FROM apps WHERE name = $1', [appName])
        .then((response)=>{
            if( [...response.rows] == ''){
                pool.query(
                    'INSERT INTO apps (apphash, userHash, category, name, price, descript, photo, date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [
                        apphash,
                        userHash,
                        category, 
                        appName, 
                        price, 
                        description, 
                        photo,
                        date
                    ])
                    .then((added)=>{
                        res.status(200).end('APP CREATED.');
                    })
                    .catch((err)=>{
                        err.status(500).send({
                            error: 'CONNECTION ERROR'
                        });
                    }) 
            }else{
                res.status(502).send({
                    error: 'APP ALREADY REGISTERED'
                });
            }
        })
        .catch((err)=>{
            err.status(500).send({
                error: 'CONNECTION ERROR'
            });
        });
}

const getMainApps = async (req,res)=>{
    const app = JSON.parse(req.query.category)
    let finalRes = []
    for (let i = 0; i < app.length; i++) {
        await pool.query('SELECT * FROM apps WHERE category = $1 ORDER BY date DESC FETCH FIRST 3 ROWS ONLY', [app[i]])
        .then((response)=>{
            finalRes[i] = {[response.rows.category]: response.rows }
        })
    }
    for (let i = 0; i < finalRes.length; i++) {
        if(finalRes[i].undefined == ''){
            finalRes[i] = 'empty'
        }else{
            finalRes[i] = finalRes[i].undefined
        }
    }
    res.status(200).send(finalRes)
}

const getCategoryApps = async (req,res)=>{
    const category = JSON.parse(req.query.category)
    let finalRes = []
    if(category == 'All'){
        for (let i = 0; i < category.length; i++) {
            await pool.query('SELECT * FROM apps ORDER BY date DESC')
            .then((response)=>{
                finalRes[i] = {[response.rows.category]: response.rows }
            })
        }
        res.status(200).send(finalRes[0].undefined)
    }else{
        for (let i = 0; i < category.length; i++) {
            await pool.query('SELECT * FROM apps WHERE category = $1 ORDER BY date DESC', [category[i]])
            .then((response)=>{
                finalRes[i] = {[response.rows.category]: response.rows }
            })
        }
        res.status(200).send(finalRes[0].undefined)
    }
}

const getUserWishlistApps = async (req,res)=>{
    let { wishlist } = req.query;
    wishlist = wishlist.split(',');
    let finalRes = [];
    for (let i = 0; i < wishlist.length; i++) {
        await pool.query('SELECT * FROM apps WHERE apphash = $1 ORDER BY date DESC', [wishlist[i]])
        .then((response)=>{
            finalRes[i] = response.rows
        }).catch((err)=>{
            res.status(500).send('Error: connection error')
        })
    }
    finalRes.forEach((element, i)=>{
        finalRes[i] = [...element]
    })
    res.status(200).send(finalRes)
}

const getDeveloperApps = async (req,res)=>{
    const { userhash } = req.query;
    let finalRes = [];
    await pool.query('SELECT * FROM apps WHERE userhash = $1 ORDER BY date DESC', [userhash])
    .then((response)=>{
        res.status(200).send(response.rows)
    }).catch(()=>{
        res.status(500).send('Error: Connection Error.')
    })
}

const getUserApps = async (req,res)=>{
    let { userApps } = req.query;
    userApps = userApps.split(',');
    let finalRes = [];
    for (let i = 0; i < userApps.length; i++) {
        await pool.query('SELECT * FROM apps WHERE apphash = $1 ORDER BY date DESC', [userApps[i]])
        .then((response)=>{
            finalRes[i] = response.rows
        }).catch((err)=>{
            res.status(500).send('Error: connection error')
        })
    }
    finalRes.forEach((element, i)=>{
        finalRes[i] = [...element]
    })
    res.status(200).send(finalRes)
}


const deleteApp = async (req,res)=>{
    const { apphash } = req.query 
    pool.query('DELETE FROM apps WHERE apphash = $1', [apphash])
    .then((res)=>{
        res.send('deleted')
    })
    .catch((err)=>{
        res.send('error: not deleted')
    })
}

const updateApp = (req, res)=>{
    const { apphash, descript, price } = req.body
    pool.query('UPDATE apps SET descript = $1, price = $2 WHERE apphash = $3', [
        descript,
        price,
        apphash
    ]).then((response)=>{
        res.status(200).send('APP UPDATE')
    }).catch((error)=>{
        res.status(500).send('ERROR: CONNECTION ERROR')
    })
}

const getImage = (req,res)=>{
    let img = JSON.stringify(req.query.img)
    img = img.replace(/['"]+/g, '')
    imgPath = path.join(__dirname, '../assets/appImages/' + img)
    res.sendFile(imgPath)
}

// CATEGORIES RELATED

const getCategories = (req, res)=>{
    pool.query(`SELECT * FROM categories`)
    .then((response)=>{
        res.status(200).send(response.rows)
    })
    .catch((err)=>{
        res.status(500).send({error: 'CONNECTION ERROR'})
    }) 
}


module.exports = {
    registerUser,
    login,
    getUser,
    getCategories,
    registerApp,
    getMainApps,
    getImage,
    getCategoryApps,
    updateWishlist,
    getUserWishlistApps,
    getDeveloperApps,
    updateApp,
    updateUserApps,
    getUserApps,
    deleteApp
}