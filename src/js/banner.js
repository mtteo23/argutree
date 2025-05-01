function loadBanner() {
  // Create a container for the banner
  const banner = document.createElement('div');

  // Create each <a> element manually
  const mainPage = document.createElement('a');
  mainPage.href = "index.html";
  mainPage.textContent = "Main Page";
  mainPage.setAttribute('align', 'center');
  banner.appendChild(mainPage);
  banner.appendChild(document.createTextNode(' ')); // Add space

  const explore = document.createElement('a');
  explore.href = "explore.html";
  explore.textContent = "Explore";
  banner.appendChild(explore);
  banner.appendChild(document.createTextNode(' ')); // Add space

  const loginLink = document.createElement('a');
  loginLink.href = "login.html";
  loginLink.textContent = "Log in";
  banner.appendChild(loginLink);
  banner.appendChild(document.createTextNode(' ')); // Add space

  const signupLink = document.createElement('a');
  signupLink.href = "signup.html";
  signupLink.textContent = "Sign up";
  signupLink.id = "signup";
  banner.appendChild(signupLink);

  banner.appendChild(banner);
}
document.addEventListener("DOMContentLoaded", loadBanner);
