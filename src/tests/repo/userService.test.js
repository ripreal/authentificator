
const UserService = require('../../repo/userService'); 
const UsersRepo = require('../../repo/usersRepo'); 

it('testCRUD_User', async () => {
    
    let repo = new UsersRepo(process.env.APP_PROFILE);
    try {
        await repo.deleteUsersTable();
    } catch(error) {
        console.log(error.message);
    }
    
    // TEST TABLE
    try {
        await repo.createSheme();
    } catch (error) {
        console.log(error);
        expect(error).toBeNull();
    }
    
    let uService = new UserService(repo);

    let userData = uService.emptyUser();
    userData.username = 'ripreal';
    userData.email = 'mail@host.ru';
    userData.password = '12345';
    userData.passwordconf   = '12345';

    // TEST PUT
    try {
        await uService.createUser(userData);
    } catch (error) {
        console.log(error);
        expect(error).toBeNull();
    }

    // TEST GET
    let user = null;
    try {
        user = await uService.authenticate(userData.email, userData.password);
        expect(user.username).toBe(userData.username);
    } catch (error) {
        console.log(error);
        expect(error).toBeNull();
    }

    // TEST AUTHENTIFICATE 
     try {
        let authentificated = uService.authentificated(user.token);
        expect(authentificated).toBe(true);
    } catch (error) {
        console.log(error);
        expect(error).toBeNull();
    }

    // TEST DELETE 
    try {
        await uService.delete(userData.email);
    } catch (error) {
        console.log(error);
        expect(error).toBeNull();
    }

}, 99999);

