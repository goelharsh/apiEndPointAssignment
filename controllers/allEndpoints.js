
const bodyParser = require("body-parser");
const ejs = require("ejs");
const sha256 = require("sha256");
const jwt = require("jsonwebtoken");
// const Snowflake = require("@theinternetfolks/snowflake");
const uuid = require("uuid");
const secretKey = "harshgoel8848";
const userModel = require("../models/userSchema");
const roleModel = require("../models/roleSchema");
const memberModel = require("../models/memberSchema");
const communityModel = require("../models/communitySchema");
exports.createRole = async (req, res) => {
  const name = req.body.name;
  if (name.length < 2) {
    res.send("name shoud contain min 2 characters");
  } else {
    const currentDate = new Date();
    // const dateString = currentDate.toISOString();
    // const snowflake = new Snowflake();
    // const id = Snowflake.generate;
    const id = uuid.v4();
    let new_role = {
      'id': id,
      'name': name,
      'created_at': currentDate,
      'updated_at': currentDate
    }
    let _role = new roleModel(new_role);

    _role.save().then(result => res.send({
      "status": true,
      "content": {
        "data": result
      }
    })).catch(err => res.send("something wents wrong."));

  }
};

exports.getRole = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  roleModel.find().skip(skip)
    .limit(limit)
    .then(result => {
      let data = [];
      for (let i = 0; i < result.length; i++) {
        const x = {
          "id": result[i].id,
          "name": result[i].name,
          "created_at": result[i].created_at,
          "updated_at": result[i].updated_at,
        }
        data.push(x);
      }
      const total = result.length;
    const pages = Math.ceil(total / limit);
      const response = {
        "status": true,
        "content": {
          "meta": {
            "total": total,
            "pages": pages,
            "page":page
          },
          "data": data
        }
      }

      res.send(response)

    }).catch(err => res.send("data not found"));
}
 
exports.signup = async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  if (name.length < 2) {
    res.send("name shoud contain min 2 characters");
  }
  else if (email.length < 1) { res.send("email is required."); }
  else if (password.length < 6) { res.send("password shoud contain min 6 characters"); }
  else {
    const id = uuid.v4();
    const new_user = new userModel({
      'id': id,
      'name': name,
      'email': email,
      'password': sha256(password),
      'created_at': new Date(),
    });

    const access_token = jwt.sign(id, secretKey);

    userModel.findOne({ 'email': email }).then(result => {
      if (result) {
        res.send("Email is already registerd.");
      }
      else {
        new_user.save().then(result => {
          const response = {
            "status": true,
            "content": {
              "data": {
                "id": result['id'],
                "name": result['name'],
                "email": result['email'],
                "created_at": result['created_at']
              },
              "meta": {
                "access_token": access_token
              }
            }
          }
          res.send(response);
        }).catch(err => {
          res.send("Something went wrong.");
        })
      }
    }).catch(error => {
      res.send("Something went wrong.")
    })

  }
}

exports.signin = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  userModel.findOne({ "email": email, "password": sha256(password) }).then(result => {
    if (result) {
      const response = {
        "status": true,
        "content": {
          "data": {
            "id": result['id'],
            "name": result['name'],
            "email": result['email'],
            "created_at": result['created_at']
          },
          "meta": {
            "access_token": jwt.sign(result['id'], secretKey)
          }
        }
      }
      res.send(response);
    } else {
      res.send("User not found.")
    }
  }).catch(err => { res.send("Something wet wrong.") })
}
  
exports.adminMe = async (req, res) => {
  const authHeader = req.headers.authorization;
  const bearer_token = authHeader && authHeader.split(' ')[1];
  jwt.verify(bearer_token, secretKey, (err, tokenData) => {
    if (err) {
      res.send("You have not access.");
    } else {
      const id = tokenData;
      userModel.findOne({ "id": id }).then(result => {
        if (result) {
          const response = {
            "status": true,
            "content": {
              "data": {
                "id": result['id'],
                "name": result['name'],
                "email": result['email'],
                "created_at": result['created_at']
              }
            }
          }
          res.send(response);
        } else {
          res.send("user not found.");
        }
      }).catch(err => {
        console.log(err);
        res.send("Something went wrong");
      })
    }
  })
}

exports.createCommunity = async (req, res) => {

  const authHeader = req.headers.authorization;
  const bearer_token = authHeader && authHeader.split(' ')[1];
  const name = req.body.name;
  jwt.verify(bearer_token, secretKey, (err, tokenData) => {
    if (err) {
      res.send("You have not access.");
    } else {
      if (name.length < 2) {
        res.send("name shoud contain min 2 characters");
      } else {
        const id = uuid.v4();
        const new_community = new communityModel({
          "id": id,
          "name": name,
          "slug": name + uuid.v4(),
          "owner": tokenData,
          "created_at": new Date(),
          "updated_at": new Date(),
        });
        new_community.save().then(result => {
          const response = {
            "status": true,
            "content": {
              "data": {
                "id": result["id"],
                "name": result["name"],
                "slug": result["slug"],
                "owner": result["owner"],
                "created_at": result["created_at"],
                "updated_at": result["updated_at"]
              }
            }
          }
          res.send(response);
        }).catch(err => {
          console.log(err);
          res.send("Something went wrong.")
        })

      }
    }
  })
}
  

exports.getCommunity = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    let data = await communityModel.find().skip(skip).limit(limit);;
    // res.send(data);
    let response = [];
    for (let i = 0; i < data.length; i++) {
      const owner = await userModel.findOne({ "id": data[i].owner });
      // res.send(data[i].owner);
      let x = {
        "id": data[i].id,
        "name": data[i].name,
        "slug": data[i].slug,
        "owner": {
          "id": data[i].owner,
          "name": owner['name']
        },
        "created_at": data[i].created_at,
        "updated_at": data[i].updated_at
      }
      response.push(x)
    }
    const total = await communityModel.countDocuments();
    const pages = Math.ceil(total / limit);
    response = {
      "status": true,
      "content": {
        "meta": {
          "total": total,
          "pages": pages,
          "page": page
        },
        "data": response
      }
    }
    res.send(response);
  } catch (err) {
    console.log(err);
    res.send("Somethings went wrong.");
  }
} 
   
exports.createMember = async (req, res) => {
  const authHeader = req.headers.authorization;
  const bearer_token = authHeader && authHeader.split(' ')[1];
  const community = req.body.community;
  const user = req.body.user;
  const role = req.body.role;
  jwt.verify(bearer_token, secretKey, async (err, tokenData) => {
    if (err) {
      res.send("You have not access.");
    } else {
      const new_member = new memberModel({
        'id': uuid.v4(),
        'community': community,
        'user': user,
        'role': role,
        'created_at': new Date()
      });
      try {
        const community_data = await communityModel.findOne({ "owner": tokenData });
        // console.log(tokenData);
        // res.send(community_data)
        if (community_data) {
          new_member.save().then(result => {
            const response = {
              "status": true,
              "content": {
                "data": {
                  "id": result.id,
                  "community": result.community,
                  "user": result.user,
                  "role": result.role,
                  "created_at": result.created_at
                }
              }
            }
            res.send(response);
          }).catch(err => {
            console.log(err);
            res.send("Something went wrong.")
          })
        } else {
          res.send("NOT_ALLOWED_ACCESS")
        }

      } catch (err) {
        console.log(err);
        res.send("Somthing wents wrong.")
      }
    }
  });
}

exports.memberOfCommunity = async (req, res) => {
  const communityId = req.params.id;
  let data = [];
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const members = await memberModel.find({ "community": communityId }).skip(skip).limit(limit);;
    for (let i = 0; i < members.length; i++) {
      const user = await userModel.findOne({ "id": members[i].user });
      const user_name = user.name;
      const role = await roleModel.findOne({ "id": members[i].role });
      const role_name = role.name;
      const x = {
        "id": members[i].id,
        "community": members[i].community,
        "user": {
          "id": members[i].user,
          "name": user_name
        },
        "role": {
          "id": members[i].role,
          "name": role_name
        },
        "created_at": members[i].created_at
      }
      data.push(x);
    }
    const total = await memberModel.countDocuments();
    const pages = Math.ceil(total / limit);
    data = {
      "status": true,
      "content": {
        "meta": {
          "total": total,
          "pages": pages,
          "page": page
        },
        "data": data
      }
    }
    res.send(data);
  } catch (err) {
    console.log(err);
    res.send("Somethings went wrong.")
  }
}

exports.iAmOwner = async (req, res) => {
  const authHeader = req.headers.authorization;
  const bearer_token = authHeader && authHeader.split(' ')[1];
  jwt.verify(bearer_token, secretKey, async (err, tokenData) => {
    if (err) {
      res.send("You have not access.");
    } else {

      try {
        // console.log(tokenData);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const myOwnedCommunity = await communityModel.find({ "owner": tokenData }).skip(skip).limit(limit);;
        let data = [];
        for (let i = 0; i < myOwnedCommunity.length; i++) {
          const x = {
            "id": myOwnedCommunity[i].id,
            "name": myOwnedCommunity[i].name,
            "slug": myOwnedCommunity[i].slug,
            "owner": myOwnedCommunity[i].owner,
            "created_at": myOwnedCommunity[i].created_at,
            "updated_at": myOwnedCommunity[i].updated_at
          }
          data.push(x);
        }
        const total = await communityModel.countDocuments();
        const pages = Math.ceil(total / limit);
        const response = {
          "status": true,
          "content": {
            "meta": {
              "total": total,
              "pages": pages,
              "page": page
            },
            "data": data
          }
        }
        res.send(response);
      } catch (err) {
        console.log(err);
        res.send("Something wents wrong.");
      }

    }
  });

}
   
 
exports.memberWtihOwner = async (req, res) => {
  const authHeader = req.headers.authorization;
  const bearer_token = authHeader && authHeader.split(' ')[1];
  jwt.verify(bearer_token, secretKey, async (err, tokenData) => {
    if (err) {
      res.send("You have not access.");
    } else {
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const myMembership = await memberModel.find({ "user": tokenData }).skip(skip).limit(limit);;
        let data = [];
        for (let i = 0; i < myMembership.length; i++) {
          const community_data = await communityModel.findOne({ "id": myMembership[i].community });
          let owner_name = await userModel.findOne({ "id": community_data.owner });
          owner_name = owner_name.name;
          const x = {
            "id": community_data.id,
            "name": community_data.name,
            "slug": community_data.slug,
            "owner": {
              "id": community_data.owner,
              "name": owner_name,
            },
            "created_at": community_data.created_at,
            "updated_at": community_data.updated_at
          }
          data.push(x);
        }
        const total = await memberModel.countDocuments();
        const pages = Math.ceil(total / limit);
        const response = {
          "status": true,
          "content": {
            "meta": {
              "total": total,
              "pages": pages,
              "page": page
            },
            "data": data
          }
        }
        res.send(response);
      } catch (err) {
        console.lof(err);
        res.send("Somethings wents wrong");
      }
    }
  })
}

exports.deleteMember = async (req, res) => {
  const memberId = req.params.id;
    const authHeader = req.headers.authorization;
    const bearer_token = authHeader && authHeader.split(' ')[1];
    jwt.verify(bearer_token, secretKey, async (err, tokenData) => {
      if (err) {
        res.send("You have not access.");
      } else {
        const member_data = await memberModel.findOne({ "id": memberId });
        if (member_data) {
          const communityId = member_data.community;
          const community_data = await communityModel.findOne({ "id": communityId });
          const community_owner = community_data.owner;
          if (community_owner === tokenData) {
            const result = await memberModel.deleteOne({ "id": memberId });
            if (result.deletedCount === 0) {
              return res.status(404).send('Member not found');
            }
            return res.status(200).send({
              "status": true
            });
          } else {
            res.send("NOT_ALLOWED_ACCESS")
          }
        } else {
          return res.status(404).send('Member not found');
        }
      }
    })
  
}
    