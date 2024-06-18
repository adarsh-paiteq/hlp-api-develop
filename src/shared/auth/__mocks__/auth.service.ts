import { MockDoctor } from '../../../doctors/test/stubs/doctors.stubs';
import { mockAuthService } from '../test/stubs/auth.stubs';

export const AuthService = jest.fn().mockReturnValue({
  compareHash: jest.fn().mockReturnValue(false).mockReturnValueOnce(true),
  getTokens: jest.fn().mockResolvedValue(mockAuthService),
  generateHash: jest.fn().mockResolvedValue('1234'),
  generateSecret: jest.fn().mockResolvedValue('E5HVAXQGMMBQM5J4'),
  generateOTP: jest.fn().mockResolvedValue('7639'),
  verifyOTP: jest.fn().mockResolvedValue(true).mockResolvedValueOnce(false),
  verifyRefreshToken: jest
    .fn()
    .mockResolvedValue({ data: MockDoctor.id })
    .mockResolvedValueOnce({ error: 'Some error' }),
  hashPassword: jest.fn().mockResolvedValue('bvvbxbjxjkzHSjbvcxcgv'),
  generateChangePasswordToken: jest.fn().mockResolvedValue('vcxbnvchxbvnb'),
  verifyChangePasswordToken: jest
    .fn()
    .mockResolvedValue({ data: MockDoctor.id })
    .mockResolvedValueOnce({ error: 'Some error' }),
});
