
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





describe('signIn Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
      header: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should return 400 if Email or Password is missing', async () => {
    req.body = {
      Email: 'testuser@example.com'
      // Missing Password
    };

    await adminController.signIn(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Email and Password are required' });
  });

  it('should return 400 if Email has invalid syntax', async () => {
    req.body = {
      Email: 'invalid-email',
      Password: 'password123'
    };

    await adminController.signIn(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid email syntax' });
  });

  it('should return 401 if credentials are invalid', async () => {
    req.body = {
      Email: 'testuser@example.com',
      Password: 'password123'
    };

    adminService.signIn.mockResolvedValueOnce(null);

    await adminController.signIn(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
  });

  it('should return 200 and set cookies on successful sign-in', async () => {
    req.body = {
      Email: 'testuser@example.com',
      Password: 'password123'
    };

    const mockResult = {
      token: 'mockToken',
      user: { id: 1, name: 'Test User' }
    };

    adminService.signIn.mockResolvedValueOnce(mockResult);

    await adminController.signIn(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Admin signed in successfully',
      token: 'mockToken',
      user: { id: 1, name: 'Test User' }
    });
    expect(res.cookie).toHaveBeenCalledWith('accessToken', 'mockToken', expect.objectContaining({
      httpOnly: false,
      secure: true,
      maxAge: 40 * 60 * 1000,
      domain: '.gridxmeter.com',
      path: '/',
      sameSite: 'None',
    }));
    expect(res.header).toHaveBeenCalledWith('Access-Control-Allow-Origin', expect.anything());
    expect(res.header).toHaveBeenCalledWith('Access-Control-Allow-Credentials', true);
  });

  it('should return specific error status for known errors', async () => {
    req.body = {
      Email: 'testuser@example.com',
      Password: 'password123'
    };

    const mockError = new Error('Email not found');
    mockError.status = 404;

    adminService.signIn.mockRejectedValueOnce(mockError);

    await adminController.signIn(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Email not found' });
  });

  it('should return 500 for unknown errors', async () => {
    req.body = {
      Email: 'testuser@example.com',
      Password: 'password123'
    };

    const mockError = new Error('Unknown error');

    adminService.signIn.mockRejectedValueOnce(mockError);

    await adminController.signIn(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Sign-in failed', details: 'Unknown error' });
  });
});