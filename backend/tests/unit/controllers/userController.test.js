import { vi, describe, it, expect, beforeEach } from "vitest";


const createMockConnection = {
    query: vi.fn(),
    release: vi.fn()
};

const createMockResponse = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis()
};


vi.mock('../../../src/database/db.js', () => ({
    pool:{
        getConnection: vi.fn(() => Promise.resolve(createMockConnection))
    }
}));


vi.mock('bcrypt', () => ({
    default: {
        hash: vi.fn(),
        compare: vi.fn()
    }
}));


vi.mock('../../../src/middlewares/randomPasswordGen.js', () => ({
    getRandomPassword: vi.fn()
}));


vi.mock('../../../src/middlewares/sendPasswordMail.js', () => ({
    sendPasswordViaMail: vi.fn()
}));


import bcrypt from 'bcrypt';
import { getRandomPassword } from "../../../src/middlewares/randomPasswordGen";
import { sendPasswordViaMail } from "../../../src/middlewares/sendPasswordMail";


import { getAllUsers} from "../../../src/controllers/userController";


// testing "getAllUsers" function
describe('getAllUsers', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    });


    it('sending 403 status when user is not allowed', async () => {
        const fakeUser = {id: 1, email: "test@mail.com", role: 'not_admin'};
        const req = {user: fakeUser};
        const res = createMockResponse;

        await getAllUsers(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({message : "permission denied!"});

    });


    it('sending results with 200 status', async () => {
        const fakeUser = {id: 1, email: "test@mail.com", role: 'admin'};
        const req = {user: fakeUser};
        const res = createMockResponse;
        const users = [
            {id: 2, email: "test1@mail.com", role:'employee'},
            {id: 3, email: "test2@mail.com", role:'admin'},
            {id: 4, email: "test3@mail.com", role:'employee'}
        ];
        createMockConnection.query.mockResolvedValueOnce([users]);


        await getAllUsers(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(users);
    });


    it('connection release on finally block', async () => {
        const fakeUser = {id: 1, email: "test@mail.com", role: 'admin'};
        const req = {user: fakeUser};
        const res = createMockResponse;
        createMockConnection.query.mockResolvedValueOnce([[]]);
        
        await getAllUsers(req, res);

        expect(createMockConnection.release).toHaveBeenCalledTimes(1);

    });
});


import { getUserById } from "../../../src/controllers/userController";



// testing getUserById function
describe('getUserById', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    });


    it('sending 403 status when user is not allowed', async () => {
        const fakeUser = {id: 1, email: "test@mail.com", role: 'not_admin'};
        const req = {user: fakeUser};
        const res = createMockResponse;


        await getUserById(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({message : "permission denied!"});
    });


    it('sending founded as false when user doesnt exist', async () => {

        const fakeUser = {id: 1, email: "test@mail.com", role: 'admin'};
        const req = {user: fakeUser, params: {id: 100}};
        const res = createMockResponse;
        createMockConnection.query.mockResolvedValueOnce([[]]);

        await getUserById(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            founded : false
        });
    });



    it('sending user data when user when the specified id exists', async () => {

        const fakeUser = {id: 1, email: "test@mail.com", role: 'admin'};
        const foundedUser = {
            id: 100,
            email: 'test@mail.com',
            role: 'employee'
        };
        const req = {user: fakeUser, params: {id: 100}};
        const res = createMockResponse;
        createMockConnection.query.mockResolvedValueOnce([[foundedUser]]); 



        await getUserById(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            founded : true,
            userData : foundedUser
        });
    });


    it('release connection on block finally', async () => {
        const fakeUser = {id: 1, email: "test@mail.com", role: 'admin'};
        const req = {user: fakeUser, params: {id: 100}};
        const res = createMockResponse;
        createMockConnection.query.mockResolvedValueOnce([[]]); 


        await getUserById(req, res);

        expect(createMockConnection.release).toHaveBeenCalledTimes(1);
    });
});


import { addUser } from "../../../src/controllers/userController";

// testing "addUser" function
describe('addUser', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    });


    it('sending 403 status when user is not allowed', async () => {
        const fakeUser = {id: 1, email: "test@mail.com", role: 'not_admin'};
        const req = {user: fakeUser};
        const res = createMockResponse;


        await addUser(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({message : "permission denied!"});
    });


    it('sending 400 status when email doesnt exist', async () => {
        const fakeUser = {id: 1, email: "test@mail.com", role: 'admin'};
        const newUser =  {
            nom: 'nom',
            prenom: 'prenom',
            tel: '0666666666',
            departement: 'departement', 
            email: 'test@mail.com',  
            role: 'employee'
        };
        const req = {user: fakeUser, body: {newUser}};
        const res = createMockResponse;
        getRandomPassword.mockResolvedValueOnce('random_password');
        bcrypt.hash.mockResolvedValueOnce('hashed_password');
        createMockConnection.query.mockResolvedValueOnce([[newUser]]);
        sendPasswordViaMail.mockResolvedValueOnce(false);
        

        await addUser(req, res);


        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            userAdded : false,
            emailExist : false
        });
        
    });

    it('sending 200 status and result', async () => {
        const fakeUser = {id: 1, email: "test@mail.com", role: 'admin'};
        const newUser =  {
            nom: 'nom',
            prenom: 'prenom',
            tel: '0666666666',
            departement: 'departement', 
            email: 'test@mail.com',  
            role: 'employee'
        };
        const req = {user: fakeUser, body: {newUser}};
        const res = createMockResponse;
        getRandomPassword.mockResolvedValueOnce('random_password');
        bcrypt.hash.mockResolvedValueOnce('hashed_password');
        createMockConnection.query.mockResolvedValueOnce([[newUser]]);
        sendPasswordViaMail.mockResolvedValueOnce(true);

        
        await addUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            userAdded : true,
            result: [newUser],
            emailExist : true
        });
    });


    it('release connection on finally block', async () => {
        const fakeUser = {id: 1, email: "test@mail.com", role: 'admin'};
        const newUser =  {
            nom: 'nom',
            prenom: 'prenom',
            tel: '0666666666',
            departement: 'departement', 
            email: 'test@mail.com',  
            role: 'employee'
        };
        const req = {user: fakeUser, body: newUser};
        const res = createMockResponse;
        getRandomPassword.mockResolvedValueOnce('random_password');
        bcrypt.hash.mockResolvedValueOnce('hashed_password');
        createMockConnection.query.mockResolvedValueOnce([[newUser]]);
        sendPasswordViaMail.mockResolvedValueOnce(true);

        
        await addUser(req, res);

        expect(createMockConnection.release).toHaveBeenCalledTimes(1);
    });

});




import { deleteUser } from "../../../src/controllers/userController";


// testing deleteUser function
describe('deleteUser', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    });

    it('sending 403 status when user is not allowed', async () => {
        const fakeUser = {id: 1, email: "test@mail.com", role: 'not_admin'};
        const req = {user: fakeUser};
        const res = createMockResponse;


        await addUser(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({message : "permission denied!"});
    });



    it('sending delete confirmation message', async () => {
        const fakeUser = {id: 1, email: "test@mail.com", role: 'admin'};
        const req = {user: fakeUser, params: {id: 100}};
        const res = createMockResponse;
        createMockConnection.query.mockResolvedValueOnce([[]]);

        await deleteUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            deleted : true,
            message: 'user deleted !'
        });
    });

    
    it('release connection on block finally', async () => {
        const fakeUser = {id: 1, email: "test@mail.com", role: 'admin'};
        const req = {user: fakeUser, params: {id: 100}};
        const res = createMockResponse;
        createMockConnection.query.mockResolvedValueOnce([[]]);

        await deleteUser(req, res);

        expect(createMockConnection.release).toHaveBeenCalledTimes(1);
    });
});



import { editUser } from "../../../src/controllers/userController";


// testing editUser function

describe('editUser', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    });


    it('sending 403 status when user is not allowed', async () => {
        const fakeUser = {id: 1, email: "test@mail.com", role: 'not_admin'};
        const req = {user: fakeUser};
        const res = createMockResponse;


        await addUser(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({message : "permission denied!"});
    });


    it('sending update confirmation message', async () => {
        const fakeUser = {id: 1, email: "test@mail.com", role: 'admin'};
        const updatedUser = {
            nom: 'newNom',
            prenom: 'newPrenom', 
            tel: '0777777777', 
            email: 'testupdate@mail.com', 
            departement: 'newDepartement', 
            role: 'newRole', 
            id: 100
        };
        const req = {user: fakeUser, body: updatedUser};
        const res = createMockResponse;
        createMockConnection.query.mockResolvedValueOnce([[]]);


        await editUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            updated : true, 
            message : "user updated"
        });
    });

    
    it('release connection on finally block', async () =>{
        const fakeUser = {id: 1, email: "test@mail.com", role: 'admin'};
        const updatedUser = {
            nom: 'newNom',
            prenom: 'newPrenom', 
            tel: '0777777777', 
            email: 'testupdate@mail.com', 
            departement: 'newDepartement', 
            role: 'newRole', 
            id: 100
        };
        const req = {user: fakeUser, body: updatedUser};
        const res = createMockResponse;
        createMockConnection.query.mockResolvedValueOnce([[]]);


        await addUser(req, res);

        expect(createMockConnection.release).toHaveBeenCalledTimes(1);
    });
});



import { editUserPassword } from "../../../src/controllers/userController";


// testing editUserPassword function

describe('editUserPassword', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    });

    it('sending 400 status when old password is incorrect', async () => {
        const passwords = {oldPassword: "incorrect_old_password", newPassword: "new_password"};
        const fakeUser = {id: 1, email: 'test@mail.com', motDePasse: 'old_password'};
        const req = {user: fakeUser, body: passwords};
        bcrypt.compare.mockResolvedValueOnce(false);
        const res = createMockResponse;

        await editUserPassword(req, res);


        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({message : "Incorrect old password"});
    });


    it('sending 400 status when new password is the same as the old one', async () => {
        const passwords = {oldPassword: "old_password", newPassword: "old_password"};
        const fakeUser = {id: 1, email: 'test@mail.com', motDePasse: 'old_password'};
        const req = {user: fakeUser, body: passwords};
        bcrypt.compare.mockResolvedValueOnce(true);
        bcrypt.compare.mockResolvedValueOnce(true);
        const res = createMockResponse; 
        

        await editUserPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message : "PLease choose a new password !"
        });
    });


    it('sending 200 status when password updated successfully', async () => {
        const passwords = {oldPassword: "old_password", newPassword: "new_password"};
        const fakeUser = {id: 1, email: 'test@mail.com', motDePasse: 'old_password'};
        const req = {user: fakeUser, body: passwords};
        bcrypt.compare.mockResolvedValueOnce(true);
        bcrypt.compare.mockResolvedValueOnce(false);
        bcrypt.hash.mockResolvedValueOnce('hashed_new_password');
        createMockConnection.query.mockResolvedValueOnce([[]]);
        const res = createMockResponse; 
        

        await editUserPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            updated : true
        });
    });


    it('release connection on finally block', async () => {
        const passwords = {oldPassword: "old_password", newPassword: "new_password"};
        const fakeUser = {id: 1, email: 'test@mail.com', motDePasse: 'old_password'};
        const req = {user: fakeUser, body: passwords};
        bcrypt.compare.mockResolvedValueOnce(true);
        bcrypt.compare.mockResolvedValueOnce(false);
        bcrypt.hash.mockResolvedValueOnce('hashed_new_password');
        createMockConnection.query.mockResolvedValueOnce([[]]);
        const res = createMockResponse; 
        

        await editUserPassword(req, res);

        expect(createMockConnection.release).toHaveBeenCalledTimes(1);
    });
});
