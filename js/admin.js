function adminLogin() {
  const user = document.getElementById("adminUser").value;
  const pass = document.getElementById("adminPass").value;

  if (user === "admin" && pass === "admin123") {
    window.location.href = "admin-dashboard.html";

  } else {
    document.getElementById("error").innerText = "Invalid admin credentials";
  }
}
