const { adminSignup } = require('../../admin/adminControllers');
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