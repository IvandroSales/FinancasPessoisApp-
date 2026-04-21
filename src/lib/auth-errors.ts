const ERROR_MAP: Array<[RegExp, string]> = [
  [/invalid login credentials/i, "Email ou senha incorretos."],
  [/user already registered/i, "Já existe uma conta com este email."],
  [/email not confirmed/i, "Email ainda não confirmado. Verifique sua caixa de entrada."],
  [/password should be at least/i, "A senha deve ter pelo menos 6 caracteres."],
  [/unable to validate email/i, "Email inválido. Verifique e tente novamente."],
  [/rate limit/i, "Muitas tentativas. Aguarde alguns minutos antes de tentar de novo."],
  [/signups not allowed/i, "O cadastro está desativado neste projeto."],
];

export function translateAuthError(message: string): string {
  for (const [pattern, translation] of ERROR_MAP) {
    if (pattern.test(message)) return translation;
  }
  return "Ocorreu um erro. Tente novamente.";
}
