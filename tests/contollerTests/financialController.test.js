const financialService = require('../../financial/financialService');
const { getTokenAmounts } = require('../../financial/financialContoller'); // Adjust the path accordingly

jest.mock('../../financial/financialService');

describe('getTokenAmounts', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should return token amounts with status 200', async () => {
    const mockTokenAmounts = [{ token: 'BTC', amount: 100 }, { token: 'ETH', amount: 200 }];
    financialService.getTokenAmounts.mockResolvedValue(mockTokenAmounts);

    await getTokenAmounts(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockTokenAmounts);
  });

  it('should handle database query errors and return status 500', async () => {
    const mockError = new Error('Database error');
    financialService.getTokenAmounts.mockRejectedValue(mockError);

    await getTokenAmounts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Database query failed', details: mockError });
  });

  it('should log the error when database query fails', async () => {
    const mockError = new Error('Database error');
    financialService.getTokenAmounts.mockRejectedValue(mockError);
    console.error = jest.fn();

    await getTokenAmounts(req, res);

    expect(console.error).toHaveBeenCalledWith('Error querying the database:', mockError);
  });

  it('should call financialService.getTokenAmounts once', async () => {
    financialService.getTokenAmounts.mockResolvedValue([]);

    await getTokenAmounts(req, res);

    expect(financialService.getTokenAmounts).toHaveBeenCalledTimes(1);
  });

  it('should return an empty array if no token amounts are found', async () => {
    financialService.getTokenAmounts.mockResolvedValue([]);

    await getTokenAmounts(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });
});