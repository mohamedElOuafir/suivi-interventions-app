import { describe, it, expect, vi, beforeEach } from "vitest";


// mocking the verify function of jwt
vi.mock('jsonwebtoken', () => ({
    default: {
        verify: vi.fn()
    }
}));


import jwt from 'jsonwebtoken';
import { handleAuthentification } from "../../../src/middlewares/authMiddleware";


const createMockResponse = () => {
    return {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    }
}


//test implementation
describe('handleAuthentification', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });


    it('jwt token is missing', () => {
        const req = { headers : {}};
        const res = createMockResponse();
        const next = vi.fn();

        handleAuthentification(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({message : "missed token"});
        expect(next).not.toHaveBeenCalled();
    });


    it('invalid jwt token', () => {
        const req = {headers : {authorization : "invalid token"}};
        const res = createMockResponse();
        const next = vi.fn();

        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(new Error('invalid jwt signature'), null);
        });

        handleAuthentification(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({message : "invalid or expired token"});
        expect(next).not.toHaveBeenCalled();
    });


    it('jwt token is present and valid', () => {
        const req = {headers: {authorization : 'valid jwt token'}};
        const res = createMockResponse();
        const next = vi.fn();
        const user = {id: 1, email: "test@mail.com", role: "admin"};
    

        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(null, user);
        });

        handleAuthentification(req, res ,next);

        expect(req.user).toEqual(user);
        expect(next).toHaveBeenCalledTimes(1);

    });

});


