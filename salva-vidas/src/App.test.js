import { cpfBasicoValido, limparCpf } from "./context/AuthContext";

test("normaliza e valida CPF usado no login", () => {
  expect(limparCpf("123.456.789-01")).toBe("12345678901");
  expect(cpfBasicoValido("12345678901")).toBe(true);
  expect(cpfBasicoValido("11111111111")).toBe(false);
});
