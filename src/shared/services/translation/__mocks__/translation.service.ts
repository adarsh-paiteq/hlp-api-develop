export const TranslationService = jest.fn().mockReturnValue({
  translate: jest.fn().mockReturnValue('email sent'),
});
