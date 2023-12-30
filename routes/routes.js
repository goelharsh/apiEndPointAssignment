const {createRole, getRole, signup, signin, adminMe, createCommunity, getCommunity, createMember, memberOfCommunity, iAmOwner, memberWtihOwner, deleteMember} = require("../controllers/allEndpoints")
const express = require("express")
const router = express.Router()

router.post("/v1/role", createRole)
router.get("/v1/role", getRole)
router.post("/v1/auth/signup", signup)
router.post("/v1/auth/signin",signin)
router.get("/v1/auth/me", adminMe)
router.post("/v1/community", createCommunity)
router.get("/v1/community", getCommunity)
router.post("/v1/member", createMember)
router.get('/v1/community/:id/members', memberOfCommunity)
router.get("/v1/community/me/owner",iAmOwner)
router.get("/v1/community/me/member", memberWtihOwner)
router.delete("/v1/member/:id", deleteMember)

module.exports = router