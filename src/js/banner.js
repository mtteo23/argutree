function loadBanner() {
    const banner = `
      <a href="index.html" align="center">Main Page</a>
      <a href="explore.html">Explore</a>
      <a href="login.html">Log in</a>
      <a id="signup" href="signup.html">Sign up</a>
    `;
    document.getElementById("banner").innerHTML = banner;
}
document.addEventListener("DOMContentLoaded", loadBanner);
