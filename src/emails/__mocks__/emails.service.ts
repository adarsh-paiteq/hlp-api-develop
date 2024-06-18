export const EmailsService = jest.fn().mockReturnValue({
  doctorSendForgotPassword: jest.fn().mockResolvedValue(''),
  sendDoctorForgetPin: jest.fn().mockResolvedValue(''),
});
