const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
var nodemailer = require('nodemailer');
var randomstring = require("randomstring");

const app = express();
const port = 3001;

const options = {
    client: 'mysql2',
    connection: {
        host: '127.0.0.1',
        user: 'root',
        password: '123456',
        database: 'gmail_app'
    }
}

const knex = require('knex')(options);

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/create-user', (req, res) => {
    if(req.body.first_name == '' || req.body.first_name == null) {
        res.send(JSON.stringify({success: false, message: 'Please Enter First Name'}));
    } else if(req.body.last_name == '' || req.body.last_name == null) {
        res.send(JSON.stringify({success: false, message: 'Please Enter Last Name'}));
    } else if(req.body.email == '' || req.body.email == null) {
        res.send(JSON.stringify({success: false, message: 'Please Enter Email'}));
    }
    if(req.body.first_name != '' && req.body.last_name != '' && req.body.email != '') {
        const random_password = randomstring.generate();

        const email_data =  [{
            first_name: req.body.first_name,
            last_name : req.body.last_name,
            email : req.body.email,
            password: random_password
        }];
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'akashshrimali2019@gmail.com',
                pass: 'akash@12345'
            }
        });
        const mailOptions = {
            from: 'Gmail App',
            to: req.body.email,
            subject: 'Create User Email',
            text: 'You have Successfully created account for Google Mail.\n Your Email is: '+req.body.email+'\n Your Password is: '+random_password+' \n Use Following Email and Passoword login that page.\n Link="localhost:3001/login-user"'
        };
        knex('user').select("*").where('email', req.body.email).first()
        .then((rows) => {
            if(rows != '' && rows != undefined) {
                res.send(JSON.stringify({success: false, message: 'Email Already Exist.', data: rows.email}))
            } else {
                knex('user').insert(email_data)
                .then((result) =>
                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                            res.send(JSON.stringify({success: false, message: error}));
                        } else {
                            res.send(JSON.stringify({success: true, Inserted: result[0], message: info.response}));
                        }
                    })
                )
                .catch((err) => res.send(JSON.stringify({success: false, message: err})));
            }
        })
        .catch((err) => { res.send(JSON.stringify({success: false, message: 'Login Failed.'})) });

    } else {
        res.send(JSON.stringify({success: false, message: 'User Not Created.'}));
    }
});

app.post('/login-user', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    if(email == '' || email == null) {
        res.send(JSON.stringify({success: false, message: 'Please Enter Email'}));
    } else if(password == '' || password == null) {
        res.send(JSON.stringify({success: false, message: 'Please Enter Password'}));
    }
    if(email != '' && password != '') {
        knex('user').select("*").where('email', email).andWhere('password', password).first()
        .then((rows) => {
            if(rows != '' && rows != undefined) {
                var login_data =  {
                    is_login : 'Y'
                };
                knex('user').where('email', email).update(login_data).then((rows) => {
                    res.send(JSON.stringify({success: true, message: 'Login SuccessFully.', data: rows}))
                }).catch((err) => {res.send(JSON.stringify({success: false, message: 'Login Failed.'})) });
            } else {
                res.send(JSON.stringify({success: false, message: 'Incorrect Email or Password.'}))
            }
        })
        .catch((err) => { res.send(JSON.stringify({success: false, message: 'Login Failed.'})) });
    } else {
        res.send(JSON.stringify({success: false, message: 'Login Not Successfully.'}));
    }
});

app.post('/logout-user', (req, res) => {
    const email = req.body.email;
    if(email == '' || email == null) {
        res.send(JSON.stringify({success: false, message: 'Please Enter Email'}));
    }
    if(email != '') {
        knex('user').select("*").where('email', email).andWhere('is_login', 'Y').first()
        .then((rows) => {
            if(rows != '' && rows != undefined) {
                var login_data =  {
                    is_login : 'N'
                };
                knex('user').where('email', email).update(login_data).then((rows) => {
                    res.send(JSON.stringify({success: true, message: 'Logout SuccessFully.', data: rows}))
                }).catch((err) => {res.send(JSON.stringify({success: false, message: 'Logout Failed.'})) });
            } else {
                res.send(JSON.stringify({success: true, message: 'You have already logout Please login Again.'}))
            }
        })
        .catch((err) => { res.send(JSON.stringify({success: false, message: 'Logout Failed.'})) });
    } else {
        res.send(JSON.stringify({success: false, message: 'Logout Not Successfully.'}));
    }
});

app.get('/user-emails', (req, res) => {
    const login_email = req.query.email;  

    if(login_email == '' || login_email == null) {
        res.send(JSON.stringify({success: false, message: 'Please Enter Email Address'}));
    }
    if(login_email != '') {
        knex('user').select("*").whereNot('email', login_email)
        .then((rows) => {
            if(rows != '' && rows != undefined) {
                res.send(JSON.stringify({success: true, message: 'Users Found.', data: rows}))
            } else {
                res.send(JSON.stringify({success: true, message: 'Users Not Found.'}))
            }
        })
        .catch((err) => {
            res.send(JSON.stringify({success: false, message: 'Users Found Failed.'})) 
        });
    } else {
        res.send(JSON.stringify({success: false, message: 'Users Not Found.'}));
    }
});

app.post('/send-message', (req, res) => {
    const to = req.body.to;

    const from = req.body.from;
    var subject = req.body.subject;
    var body = req.body.body;
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'akashshrimali2019@gmail.com',
            pass: 'akash@12345'
        }
    });
    const mailOptions = {
        from: from,
        to: to,
        subject: subject,
        text: body
    };
    if(to == '' || to == null) {
        res.send(JSON.stringify({success: false, message: 'Please Enter To'}));
    } else if(from == '' || from == null) {
        res.send(JSON.stringify({success: false, message: 'Please Enter From'}));
    }
    if(to != '' && from != '') {
        if(subject == undefined) {
            subject = null;
        }
        if(body == undefined) {
            body = null;
        }
        const data = {
            from_address: from,
            to_address: to,
            subject: subject,
            message: body
        }
        knex('email').insert(data).returning('id')
        .then((id) => {
            const EmailData = {
                message_id: id
            }
            knex('email').update(EmailData)
            .then((rows) => {
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        res.send(JSON.stringify({success: false, message: error}));
                    } else {
                        res.send(JSON.stringify({success: true, message: "Send Message SuccessFully."}));
                    }
                })
            })
            .catch((err) => {
                res.send(JSON.stringify({success: false, message: 'Send Message Failed.'})) 
            });
        })
        .catch((err) => {
            res.send(JSON.stringify({success: false, message: 'Send Message Failed.'})) 
        });
    } else {
        res.send(JSON.stringify({success: false, message: 'Logout Not Successfully.'}));
    }
});

app.get('/get-messages', (req, res) => {
    const to_address = req.query.email;  

    if(to_address == '' || to_address == null) {
        res.send(JSON.stringify({success: false, message: 'Please Enter Email Address'}));
    }
    if(to_address != '') {
        knex('email').select("*").where('to_address', to_address).andWhere('status', 1)
        .then((rows) => {
            if(rows != '' && rows != undefined) {
                res.send(JSON.stringify({success: true, message: 'Inbox Message Found.', data: rows}))
            } else {
                res.send(JSON.stringify({success: true, message: 'Inbox Message Not Found.'}))
            }
        })
        .catch((err) => {
            res.send(JSON.stringify({success: false, message: 'Inbox Message Failed.'})) 
        });
    } else {
        res.send(JSON.stringify({success: false, message: 'Logout Not Successfully.'}));
    }
});

app.get('/sent-message', (req, res) => {
    const from_address = req.query.email;  

    if(from_address == '' || from_address == null) {
        res.send(JSON.stringify({success: false, message: 'Please Enter Email Address'}));
    }
    if(from_address != '') {
        knex('email').select("*").where('from_address', from_address).andWhere('status', 1)
        .then((rows) => {
            if(rows != '' && rows != undefined) {
                res.send(JSON.stringify({success: true, message: 'Sent Message Found.', data: rows}))
            } else {
                res.send(JSON.stringify({success: true, message: 'Sent Message Not Found.'}))
            }
        })
        .catch((err) => {
            res.send(JSON.stringify({success: false, message: 'Sent Message Failed.'})) 
        });
    } else {
        res.send(JSON.stringify({success: false, message: 'Logout Not Successfully.'}));
    }
});

app.get('/read-message/:id', (req, res) => {
    const id = req.params.id;
    knex('email').select("*").where({'id': id}).orWhere({'message_id': id})
    .then((rows) => {
        if(rows != '' && rows != undefined) {
            var login_data =  {
                is_read : 'Y'
            };
            knex('email').where('id', id).update(login_data).then((update_rows) => {
                res.send(JSON.stringify({success: true, message: 'Messages Found.', data: rows}))
            }).catch((err) => {res.send(JSON.stringify({success: false, message: 'Logout Failed.'})) });
        } else {
            res.send(JSON.stringify({success: true, message: 'Messages Not Found.'}))
        }
    })
    .catch((err) => {
        res.send(JSON.stringify({success: false, message: 'Send Message Failed.'})) 
    });
});

app.delete('/remove-message/:id', (req, res) => {
    const id = req.params.id;
    knex('email').select("*").where('id', id).orWhere('message_id', id)
    .then((rows) => {
        if(rows != '' && rows != undefined) {
            var message_data =  {
                status : '0'
            };
            knex('email').where('id', id).update(message_data).then((update_rows) => {
                if(rows != '' && rows != undefined) {
                    res.send(JSON.stringify({success: true, message: 'Message Deleted.'}));
                } else {
                    res.send(JSON.stringify({success: true, message: 'Message Not Found.'}))
                }
            }).catch((err) => {res.send(JSON.stringify({success: false, message: err})) });
        } else {
            res.send(JSON.stringify({success: true, message: 'Message Not Found.'}))
        }
    })
    .catch((err) => {
        res.send(JSON.stringify({success: false, message: 'Delete Message Failed.'})) 
    });
});

app.delete('/remove-trash-message/:id', (req, res) => {
    const id = req.params.id;
    knex('email').select("*").where('id', id).orWhere('message_id', id)
    .then((rows) => {
        if(rows != '' && rows != undefined) {
            var message_data =  {
                status : '0'
            };
            knex('email').where('id', id).update(message_data).then((update_rows) => {
                knex('email').select("*").where({'status': '0'})
                .then((rows) => {
                    if(rows != '' && rows != undefined) {
                        knex('email').where({ id: id }).del()
                        .then((book) => res.send(JSON.stringify({success: true, message: 'Message Deleted.'})))
                        .catch((err) => res.send(JSON.stringify({success: false, message: err})));
                    } else {
                        res.send(JSON.stringify({success: true, message: 'Message Not Found.'}))
                    }
                }).catch((err) => {res.send(JSON.stringify({success: false, message: err})) });
            }).catch((err) => {res.send(JSON.stringify({success: false, message: err})) });
        } else {
            res.send(JSON.stringify({success: true, message: 'Message Not Found.'}))
        }
    })
    .catch((err) => {
        res.send(JSON.stringify({success: false, message: 'Delete Message Failed.'})) 
    });
});

app.post('/reply-message/:id', (req, res) => {
    const id = req.params.id;
    knex('email').select("*").where('id', id).first()
    .then((rows) => {
        if(rows != '' && rows != undefined) {
            var subject = rows.subject;
            const to = req.body.to;
            const from = req.body.from;
            var body = req.body.body;
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'akashshrimali2019@gmail.com',
                    pass: 'akash@12345'
                }
            });
            const mailOptions = {
                from: from,
                to: to,
                subject: subject,
                text: body
            };
            if(to == '' || to == null) {
                res.send(JSON.stringify({success: false, message: 'Please Enter To'}));
            } else if(from == '' || from == null) {
                res.send(JSON.stringify({success: false, message: 'Please Enter From'}));
            }
            if(to != '' && from != '') {
                if(subject == undefined) {
                    subject = null;
                }
                if(body == undefined) {
                    body = null;
                }
                const data = {
                    message_id: id,
                    from_address: from,
                    to_address: to,
                    subject: subject,
                    message: body
                }
                knex('email').insert(data)
                .then((rows) => {
                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                            res.send(JSON.stringify({success: false, message: error}));
                        } else {
                            res.send(JSON.stringify({success: true, message: "Reply Message SuccessFully."}));
                        }
                    })
                })
                .catch((err) => {
                    res.send(JSON.stringify({success: false, message: 'Reply Message Failed.'})) 
                });
            } else {
                res.send(JSON.stringify({success: false, message: 'Reply Message Not Successfully.'}));
            }
        } else {
            res.send(JSON.stringify({success: true, message: 'Messages Not Found.'}))
        }
    })
    .catch((err) => {
        res.send(JSON.stringify({success: false, message: 'Messages Not Found.'})) 
    });
});

app.get('/trash-message', (req, res) => {
    knex('email').select("*").where({'status': '0'})
    .then((rows) => {
        if(rows != '' && rows != undefined) {
            res.send(JSON.stringify({success: true, message: 'Trash Message Found.', data: rows}))
        } else {
            res.send(JSON.stringify({success: true, message: 'Trash Message Not Found.'}))
        }
    })
    .catch((err) => {
        res.send(JSON.stringify({success: false, message: 'Trash Message Failed.'})) 
    });
});

app.get('/count-message/:id', (req, res) => {
    const id = req.params.id;
    knex('email').count('id as count').where('id', id).orWhere('message_id', id).first()
    .then((rows) => {
        var result = rows['count'];
        if(rows != '' && rows != undefined) {
            res.send(JSON.stringify({success: true, message: 'Message Found.', count:result}))
        } else {
            res.send(JSON.stringify({success: true, message: 'Message Not Found.'}))
        }
    })
    .catch((err) => {
        res.send(JSON.stringify({success: false, message: 'Get Message Failed.'})) 
    });
});

app.listen(port, () => console.log(`Email app listening on port ${port}!`));
