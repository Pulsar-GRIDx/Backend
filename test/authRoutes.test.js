const { updateAdminStatus } = require('../admin/adminService');
const connection = require('../config/db'); // Assuming connection is exported from the config file

jest.mock('../config/db', () => ({
  query: jest.fn(),
}));

describe('updateAdminStatus', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should update admin status successfully', async () => {
    // Mock query result for checking user
    const checkUserResult = [{ Admin_ID: '10', IsActive: 1 }];
    connection.query.mockImplementation((query, params, callback) => {
      callback(null, checkUserResult);
    });

    // Mock query result for updating status
    const updateStatusResult = { affectedRows: 1 };
    connection.query.mockImplementationOnce((query, params, callback) => {
      callback(null, updateStatusResult);
    });

    const newStatus = await updateAdminStatus('10');
    expect(newStatus).toBe(0); // Assuming the status toggles between 0 and 1
  });

  test('should handle database error', async () => {
    const errorMessage = 'Database error';
    connection.query.mockImplementation((query, params, callback) => {
      callback(new Error(errorMessage));
    });

    await expect(updateAdminStatus('10')).rejects.toThrow(errorMessage);
  });
});
