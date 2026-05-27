
document.getElementById("btnLogin").onclick = () => {
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;
  const erro = document.getElementById("erro");

  
  if (usuario === "admin" && senha === "1234") {
    localStorage.setItem("logado", "true");
    window.location.href = "index.html";
  } else {
    erro.textContent = "Usuário ou senha inválidos";
  }
};