import { MockDoctor } from '../test/stubs/doctors.stubs';
const blockedUser = { ...MockDoctor, status: false };
const isEmailVerifiedDoctor = {
  ...MockDoctor,
  is_email_verified: false,
};
const validDoctor = blockedUser ? blockedUser : isEmailVerifiedDoctor;
export const DoctorsRepo = jest.fn().mockReturnValue({
  getDoctorByEmail: jest
    .fn()
    .mockResolvedValue([MockDoctor])
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce([validDoctor]),
  updateDoctorById: jest.fn().mockResolvedValue(MockDoctor),
  getDoctorById: jest
    .fn()
    .mockResolvedValue(MockDoctor)
    .mockResolvedValueOnce(null),
});
