import { describe, it, expect, vi, beforeEach } from "vitest";


const createMockConnection = {
    query: vi.fn(),
    release: vi.fn()
}

const createMockResponse = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis()
}


vi.mock('../../../src/database/db.js', () => ({
    pool: {
        getConnection: vi.fn(() => Promise.resolve(createMockConnection))
    }
}));


vi.mock('bcrypt', () => ({
    default: {
        compare: vi.fn()
    }
}));


vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vi.fn()
    }
}));


import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { userAuthentification } from '../../../src/controllers/authController';


describe('userAuthentication', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    });


    it('sending 401 status when email doesnt exist', async() => {
        
        const req = {body: {email: 'false@mail.com', password: 'something'}};
        const res = createMockResponse;
        createMockConnection.query.mockResolvedValueOnce([[]]);
        

        await userAuthentification(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            available : false,
            message : "user not found !"
        });
        
    });


    it('sending 401 status when password is incorrect', async () => {

        const user = {id: 1, email: 'test@mail.com', motDePasse: 'hashed_password'};
        createMockConnection.query.mockResolvedValueOnce([[user]]);
        bcrypt.compare.mockResolvedValueOnce(false);
        const req = {body: {email: 'test@mail.com', password: 'falsePassword'}};
        const res = createMockResponse;


        await userAuthentification(req, res);

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({available : false, message : "Wrong password !"});

    });


    it('sending jwt token and user data if email and password are valid', async () => {
        const user = {id: 1, email: 'test@mail.com', motDePasse: 'hashed_password'};
        createMockConnection.query.mockResolvedValueOnce([[user]]);
        bcrypt.compare.mockResolvedValueOnce(true);
        jwt.sign.mockReturnValueOnce('jwt-token');


        const req = {body: {email: 'test@mail.com', password: 'correct_password'}};
        const res = createMockResponse;

        await userAuthentification(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            available : true,
            token: 'jwt-token',
            userData : user,
        });

    });


    it('release the connection on finally block', async () => {
        createMockConnection.query.mockResolvedValueOnce([[]]);
        const req = {body: {email: 'x@mail.com', password: 'password'}};
        const res = createMockResponse;

        await userAuthentification(req, res);

        expect(createMockConnection.release).toHaveBeenCalledTimes(1);
    });
});




