import test from 'node:test'
import assert from 'node:assert/strict'
import supertest from 'supertest'
import bcrypt from 'bcryptjs'
import app from '../main.js'
import prisma from '../src/utils/prisma-client.js'

const request = supertest(app)

test.describe('Auth flows', () => {
  let adminUser
  let regularUser
  let adminCreds = { name: 'Admin Tester', email: 'admin@test.local', password: 'AdminPass123!' }
  let userCreds = { name: 'User Tester', email: 'user@test.local', password: 'UserPass123!' }

  test.before(async () => {
    // ensure test DB cleaned for these emails
    await prisma.passwordResetToken.deleteMany({ where: { } })
    await prisma.refreshToken.deleteMany({ where: { } })
    await prisma.user.deleteMany({ where: { email: { in: [adminCreds.email, userCreds.email] } } })

    const hashedAdmin = await bcrypt.hash(adminCreds.password, 10)
    adminUser = await prisma.user.create({ data: { name: adminCreds.name, email: adminCreds.email, password: hashedAdmin, role: 'ADMIN' } })

    const hashedUser = await bcrypt.hash(userCreds.password, 10)
    regularUser = await prisma.user.create({ data: { name: userCreds.name, email: userCreds.email, password: hashedUser, role: 'USER' } })
  })

  test.after(async () => {
    await prisma.refreshToken.deleteMany({ where: { userId: { in: [adminUser.id, regularUser.id] } } })
    await prisma.passwordResetToken.deleteMany({ where: { userId: { in: [adminUser.id, regularUser.id] } } })
    await prisma.user.deleteMany({ where: { id: { in: [adminUser.id, regularUser.id] } } })
  })

  test('login returns access and refresh tokens', async () => {
    const res = await request.post('/api/users/login').send({ email: userCreds.email, password: userCreds.password })
    assert.equal(res.status, 200)
    assert.ok(res.body.data.accessToken)
    assert.ok(res.body.data.refreshToken)
  })

  test('refresh token returns rotated tokens', async () => {
    const login = await request.post('/api/users/login').send({ email: userCreds.email, password: userCreds.password })
    const { refreshToken } = login.body.data
    const res = await request.post('/api/users/token').send({ refreshToken })
    assert.equal(res.status, 200)
    assert.ok(res.body.data.accessToken)
    assert.ok(res.body.data.refreshToken)
    assert.notEqual(res.body.data.refreshToken, refreshToken)
  })

  test('logout revokes refresh token', async () => {
    const login = await request.post('/api/users/login').send({ email: userCreds.email, password: userCreds.password })
    const { refreshToken } = login.body.data
    const res = await request.post('/api/users/logout').send({ refreshToken })
    assert.equal(res.status, 200)

    // token should be revoked in DB
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })
    assert.ok(stored.revoked)
  })

  test('password reset request and confirm', async () => {
    const req = await request.post('/api/users/password-reset/request').send({ email: userCreds.email })
    assert.equal(req.status, 200)
    const { token } = req.body.data
    assert.ok(token)

    const confirm = await request.post('/api/users/password-reset/confirm').send({ token, newPassword: 'NewPass123!' })
    assert.equal(confirm.status, 200)

    // login with new password
    const login = await request.post('/api/users/login').send({ email: userCreds.email, password: 'NewPass123!' })
    assert.equal(login.status, 200)
    assert.ok(login.body.data.accessToken)
  })
})
