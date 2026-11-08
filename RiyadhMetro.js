let mybutton = document.getElementById("myBtn");

window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

document.addEventListener("DOMContentLoaded", function() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    
      document.getElementById("username-display").textContent = user.username;
      document.getElementById("username-link").href = "account.html"; 
  } else {
      document.getElementById("username-link").href = "login.html";
  }
});

function logout() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

