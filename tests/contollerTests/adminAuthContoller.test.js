const { adminSignup, getUserProfile ,  getAllUsers , resetAdminPassword} = require('../../admin/adminControllers');
const adminService = require('../../admin/adminService');

jest.mock('../../admin/adminService');

describe('adminSignup', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        Username: 'testuser',
        Password: 'password123',
        FirstName: 'John',
        LastName: 'Doe',
        Email: 'john.doe@example.com',
        IsActive: true,
        RoleName: 'Admin',
        AccessLevel: 1
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('should return 400 if required fields are missing or invalid', async () => {
    req.body.Username = ''; // Invalid Username

    await adminSignup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid required fields in request body' });
  });

  it('should return 409 if Username already exists', async () => {
    adminService.isUsernameTaken.mockResolvedValue(true);

    await adminSignup(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'Username already exists' });
  });

  it('should return 409 if Email already exists', async () => {
    adminService.isUsernameTaken.mockResolvedValue(false);
    adminService.isEmailTaken.mockResolvedValue(true);

    await adminSignup(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'Email already exists' });
  });

  it('should return 201 if registration is successful', async () => {
    adminService.isUsernameTaken.mockResolvedValue(false);
    adminService.isEmailTaken.mockResolvedValue(false);
    adminService.registerAdmin.mockResolvedValue();

    await adminSignup(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Registration successful' });
  });

  it('should return 500 if there is an error during registration', async () => {
    adminService.isUsernameTaken.mockResolvedValue(false);
    adminService.isEmailTaken.mockResolvedValue(false);
    adminService.registerAdmin.mockRejectedValue(new Error('Registration error'));

    await adminSignup(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Registration failed', details: 'Registration error' });
  });
});



describe('getUserProfile', () => {
  let req, res;

  beforeEach(() => {
    req = { params: { UserID: '123' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('should return 200 status code and an empty user profile when no user profile is found for the provided UserID', async () => {
    adminService.getUserProfile.mockResolvedValue(null);

    await getUserProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(null);
  });

  it('should return 400 status code when UserID is not provided', async () => {
    req.params.UserID = undefined;

    await getUserProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid UserID' });
  });

  it('should return 500 status code when there is an error fetching the user profile', async () => {
    const error = new Error('Database error');
    adminService.getUserProfile.mockRejectedValue(error);

    await getUserProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch user profile', details: error });
  });

  it('should call adminService.getUserProfile with the correct UserID', async () => {
    await getUserProfile(req, res);

    expect(adminService.getUserProfile).toHaveBeenCalledWith('123');
  });

  it('should return 200 status code and the user profile when a user profile is found', async () => {
    const userProfile = { UserID: '123', FirstName: 'John', LastName: 'Doe' };
    adminService.getUserProfile.mockResolvedValue(userProfile);

    await getUserProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(userProfile);
  });
});



describe('getAllUsers', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('should return 200 and a list of users when adminService.getAllUsers resolves', async () => {
    const mockUsers = [{ id: 1, name: 'John Doe' }, { id: 2, name: 'Jane Doe' }];
    adminService.getAllUsers.mockResolvedValue(mockUsers);

    await getAllUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUsers);
  });

  it('should return 500 and an error message when adminService.getAllUsers rejects', async () => {
    const mockError = new Error('Internal server error');
    adminService.getAllUsers.mockRejectedValue(mockError);

    await getAllUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error', details: mockError });
  });

  it('should call adminService.getAllUsers once', async () => {
    adminService.getAllUsers.mockResolvedValue([]);

    await getAllUsers(req, res);

    expect(adminService.getAllUsers).toHaveBeenCalledTimes(1);
  });

  it('should handle empty user list correctly', async () => {
    adminService.getAllUsers.mockResolvedValue([]);

    await getAllUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it('should handle unexpected errors gracefully', async () => {
    const unexpectedError = new Error('Unexpected error');
    adminService.getAllUsers.mockRejectedValue(unexpectedError);

    await getAllUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error', details: unexpectedError });
  });
});




describe('resetAdminPassword', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { Admin_ID: '123' },
      body: { Password: 'newPassword123' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('should return 400 if Password is not provided', async () => {
    req.body.Password = '';

    await resetAdminPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Please enter a new password' });
  });

  it('should return 404 if admin is not found', async () => {
    adminService.resetAdminPassword.mockRejectedValue(new Error('Admin not found'));

    await resetAdminPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Admin not found' });
  });

  it('should return 500 for other errors', async () => {
    adminService.resetAdminPassword.mockRejectedValue(new Error('Some internal error'));

    await resetAdminPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error', details: 'Some internal error' });
  });

  it('should return 200 if password is updated successfully', async () => {
    adminService.resetAdminPassword.mockResolvedValue();

    await resetAdminPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Password updated successfully' });
  });

  it('should handle invalid Admin_ID type', async () => {
    req.params.Admin_ID = null;

    await resetAdminPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid Admin_ID, enter a valid ID' });
  });
});