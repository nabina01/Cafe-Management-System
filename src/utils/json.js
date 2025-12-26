//JSON utils
import jwt from 'jsonwebtoken'

// generate token
const generateToken = (user) => {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '100h'
    })
    return token
}

// verify token
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        return decoded
    } catch (error) {
        return null
    }
}

// standardized success response
const successResponse = (res, payload = {}, message = 'OK') => {
    const status = 200
    const body = { success: true, message }

    if (Array.isArray(payload)) {
        body.data = payload
    } else if (payload && typeof payload === 'object') {
        // if payload already contains data or message, merge
        if (payload.data !== undefined) body.data = payload.data
        else Object.assign(body, payload)
    } else if (payload !== undefined) {
        body.data = payload
    }

    return res.status(status).json(body)
}

// standardized error response
const errorResponse = (res, error = 'Something went wrong', status = 500) => {
    const message = typeof error === 'string' ? error : (error?.message || 'Server Error')
    return res.status(status).json({ success: false, message })
}

export { generateToken, verifyToken, successResponse, errorResponse }

