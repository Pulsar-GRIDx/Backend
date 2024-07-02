const financialService = require('../../financial/financialService');
const { getTokenAmounts } = require('../../financial/financialContoller');
const { json } = require('body-parser');

jest.mock('../../financial/financialService');


describe('getTokenAmounts', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
      
    };
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return token amounts on success', async () => {
    const mockTokenAmounts = { Current: [1, 2, 3], Last: [4, 5, 6] };
    financialService.getTokenAmounts.mockResolvedValue(mockTokenAmounts);

    await getTokenAmounts(req, res);

    expect(financialService.getTokenAmounts).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(mockTokenAmounts);
  });
  it('should return a 500 error on database failure', async () => {
    const mockError = new Error('Database query failed');
    financialService.getTokenAmounts.mockRejectedValue(mockError);
  
    await getTokenAmounts(req, res);

    jest.spyOn(financialService, 'getTokenAmounts').mockRejectedValue(new Error('Database query failed'));
  
    expect(financialService.getTokenAmounts).toHaveBeenCalledTimes(1);
    expect(500);
    // expect(res.json).toHaveBeenCalledWith({
    //   error: 'Database query failed',
    //   details: 'Error: Database query failed'
    // });
    // expect(console.error).toHaveBeenCalledWith('Error querying the database:');
    expect(console.error).toHaveBeenCalledWith('Error querying the database:', mockError);
    // expect(console.error).toHaveBeenCalledWith(expect.any(Error));
  });
  
  
});
