
const adminController = require('../../admin/adminControllers');
const adminService = require('../../admin/adminService');

jest.mock('../../admin/adminService');

describe('adminSignup Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should return 400 if any required field is missing', async () => {
    req.body = {
      Username: 'testuser',
      Password: 'password123',
      FirstName: 'Test',
      LastName: 'User',
      Email: 'testuser@example.com',
      IsActive: true,
      RoleName: 'Admin'
      // Missing AccessLevel
    };

    await adminController.adminSignup(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields in request body' });
  });

  it('should return 201 and success message on successful registration', async () => {
    req.body = {
      Username: 'testuser',
      Password: 'password123',
      FirstName: 'Test',
      LastName: 'User',
      Email: 'testuser@example.com',
      IsActive: true,
      RoleName: 'Admin',
      AccessLevel: 1
    };
    adminService.registerAdmin.mockResolvedValueOnce();

    await adminController.adminSignup(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Registration successful' });
    expect(adminService.registerAdmin).toHaveBeenCalledWith(
      'testuser',
      'password123',
      'Test',
      'User',
      'testuser@example.com',
      true,
      'Admin',
      1
    );
  });

  it('should return 500 and error message on registration failure', async () => {
    req.body = {
      Username: 'testuser',
      Password: 'password123',
      FirstName: 'Test',
      LastName: 'User',
      Email: 'testuser@example.com',
      IsActive: true,
      RoleName: 'Admin',
      AccessLevel: 1
    };
    adminService.registerAdmin.mockRejectedValueOnce(new Error('Registration error'));

    await adminController.adminSignup(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Registration failed', error: 'Registration error' });
  });
});